import "server-only";
import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fileTypeFromBuffer } from "file-type";
import type { StoredAttachment } from "@/lib/db/schema";
import { ATTACHMENT, validateAttachment, type ValidationErrorKey } from "@/lib/validation/shared";

/** Dossiers du stockage, un par formulaire qui accepte des pièces jointes. */
export type StorageFolder = "project-requests" | "tests";

/** Extension enregistrée selon le format réel du fichier. */
const EXTENSIONS: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

/** Longueur maximale conservée pour le nom d'origine d'un fichier. */
const MAX_FILENAME_LENGTH = 150;

type StorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
};

function readConfig(): StorageConfig {
  const {
    STORAGE_ENDPOINT,
    STORAGE_REGION,
    STORAGE_BUCKET,
    STORAGE_ACCESS_KEY_ID,
    STORAGE_SECRET_ACCESS_KEY,
  } = process.env;

  if (
    !STORAGE_ENDPOINT ||
    !STORAGE_BUCKET ||
    !STORAGE_ACCESS_KEY_ID ||
    !STORAGE_SECRET_ACCESS_KEY
  ) {
    throw new Error(
      "Configuration du stockage incomplète : vérifiez STORAGE_ENDPOINT, STORAGE_BUCKET, STORAGE_ACCESS_KEY_ID et STORAGE_SECRET_ACCESS_KEY dans .env.local.",
    );
  }

  return {
    // Une éventuelle barre oblique finale est retirée : l'endpoint ne doit contenir que l'adresse du service.
    endpoint: STORAGE_ENDPOINT.replace(/\/+$/, ""),
    region: STORAGE_REGION || "auto",
    bucket: STORAGE_BUCKET,
    accessKeyId: STORAGE_ACCESS_KEY_ID,
    secretAccessKey: STORAGE_SECRET_ACCESS_KEY,
  };
}

let client: S3Client | undefined;

function getClient(config: StorageConfig): S3Client {
  client ??= new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // Le nom du compartiment est placé dans le chemin de l'adresse, et non devant le domaine :
    // indispensable pour les compartiments en juridiction UE (certificat TLS de Cloudflare).
    forcePathStyle: true,
    // Compatibilité R2 : sommes de contrôle calculées seulement quand elles sont requises.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

/** Nom d'origine nettoyé : sans chemin ni caractères de contrôle, longueur limitée. */
function sanitizeFilename(name: string): string {
  const baseName = name.split(/[\\/]/).pop() ?? "";

  const cleaned = baseName.replace(/[\u0000-\u001f\u007f"]/g, "").trim();
  return cleaned.slice(0, MAX_FILENAME_LENGTH) || "fichier";
}

export type AttachmentInspection =
  | { ok: true; buffer: Buffer; mimeType: string; name: string }
  | { ok: false; error: ValidationErrorKey };

/**
 * Vérifie une pièce jointe reçue par le serveur : nom, type annoncé, taille,
 * puis format réel d'après le contenu du fichier.
 */
export async function inspectAttachment(file: File): Promise<AttachmentInspection> {
  const declaredError = validateAttachment(file);
  if (declaredError) {
    return { ok: false, error: declaredError };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > ATTACHMENT.maxSizeBytes) {
    return { ok: false, error: "fileTooLarge" };
  }

  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !(ATTACHMENT.mimeTypes as readonly string[]).includes(detected.mime)) {
    return { ok: false, error: "invalidFileType" };
  }

  return { ok: true, buffer, mimeType: detected.mime, name: sanitizeFilename(file.name) };
}

type UploadParams = {
  folder: StorageFolder;
  buffer: Buffer;
  mimeType: string;
  name: string;
};

/** Enregistre un fichier vérifié sur le stockage, sous un nom aléatoire. */
export async function uploadAttachment({
  folder,
  buffer,
  mimeType,
  name,
}: UploadParams): Promise<StoredAttachment> {
  const config = readConfig();
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const extension = EXTENSIONS[mimeType] ?? "";
  const key = `${folder}/${now.getUTCFullYear()}/${month}/${randomUUID()}${extension}`;

  await getClient(config).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
    }),
  );

  return { key, name, size: buffer.byteLength, mimeType };
}

/**
 * Lien de téléchargement temporaire d'une pièce jointe (5 minutes par défaut).
 * Utilisé par le dashboard : les fichiers ne sont jamais accessibles publiquement.
 */
export async function getAttachmentDownloadUrl(
  key: string,
  expiresInSeconds = 300,
): Promise<string> {
  const config = readConfig();

  return getSignedUrl(
    getClient(config),
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
    { expiresIn: expiresInSeconds },
  );
}
