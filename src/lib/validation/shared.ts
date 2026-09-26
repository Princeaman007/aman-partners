import { z } from "zod";

/** Clés des messages d'erreur. Leurs textes sont dans les traductions, bloc « Forms.errors ». */
export type ValidationErrorKey =
  | "required"
  | "tooLong"
  | "invalidEmail"
  | "invalidPhone"
  | "invalidUrl"
  | "invalidOption"
  | "selectAtLeastOne"
  | "consentRequired"
  | "invalidNumber"
  | "fileTooLarge"
  | "invalidFileType";

/** Longueurs maximales des champs, en caractères. */
export const LIMITS = {
  name: 100,
  company: 150,
  email: 254,
  phone: 30,
  country: 100,
  shortText: 300,
  url: 300,
  message: 5000,
} as const;

/** Statut initial de toute demande reçue, pour préparer le futur CRM. */
export const INITIAL_STATUS = "new";
export type RequestStatus = typeof INITIAL_STATUS;

/** Pièce jointe acceptée : PDF, DOCX, PNG ou JPG, 10 Mo maximum. */
export const ATTACHMENT = {
  maxSizeBytes: 10 * 1024 * 1024,
  mimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ],
  extensions: [".pdf", ".docx", ".png", ".jpg", ".jpeg"],
} as const;

const PHONE_PATTERN = /^\+?[0-9\s().-]{6,30}$/;

/** Texte obligatoire : espaces retirés aux extrémités, non vide, longueur limitée. */
export function requiredText(max: number) {
  return z.string().trim().min(1, "required").max(max, "tooLong");
}

/** Texte facultatif : peut rester vide, longueur limitée. */
export function optionalText(max: number) {
  return z.string().trim().max(max, "tooLong");
}

/**
 * Choix obligatoire dans une liste fermée (menu déroulant, boutons radio).
 * Aucun choix : « required ». Valeur hors liste : « invalidOption ».
 */
export function choiceField<const T extends readonly [string, ...string[]]>(values: T) {
  return z.enum(values, {
    error: (issue) =>
      issue.input === undefined || issue.input === "" ? "required" : "invalidOption",
  });
}

/** Adresse e-mail obligatoire, enregistrée en minuscules. */
export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "required")
  .max(LIMITS.email, "tooLong")
  .pipe(z.email("invalidEmail"));

/** Téléphone facultatif : chiffres, espaces, +, points, tirets et parenthèses. */
export const optionalPhoneField = z
  .string()
  .trim()
  .max(LIMITS.phone, "tooLong")
  .refine((value) => value === "" || PHONE_PATTERN.test(value), "invalidPhone");

/** Adresse web facultative, en http ou https uniquement. */
export const optionalUrlField = z
  .string()
  .trim()
  .max(LIMITS.url, "tooLong")
  .refine((value) => {
    if (value === "") {
      return true;
    }
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "invalidUrl");

/** Case de consentement RGPD : doit être cochée. */
export const consentField = z.boolean().refine((value) => value, "consentRequired");

/**
 * Champ piège anti-robots, invisible pour les visiteurs.
 * Un humain le laisse vide ; un robot qui remplit tous les champs se trahit.
 */
export const honeypotField = z.string().max(0).optional();

/** Paramètres de campagne conservés pendant la visite et envoyés avec le formulaire. */
export const trackingSchema = z
  .object({
    utm_source: z.string().max(LIMITS.shortText).optional(),
    utm_medium: z.string().max(LIMITS.shortText).optional(),
    utm_campaign: z.string().max(LIMITS.shortText).optional(),
    utm_content: z.string().max(LIMITS.shortText).optional(),
    utm_term: z.string().max(LIMITS.shortText).optional(),
    gclid: z.string().max(LIMITS.shortText).optional(),
    fbclid: z.string().max(LIMITS.shortText).optional(),
  })
  .optional();

export type TrackingData = z.infer<typeof trackingSchema>;

/** Ce qu'il faut connaître d'un fichier pour le vérifier : le File du navigateur convient. */
type AttachmentLike = {
  name: string;
  size: number;
  type: string;
};

/**
 * Vérifie une pièce jointe (type et taille), dans le navigateur comme sur le serveur.
 * Renvoie la clé d'erreur, ou null si le fichier est accepté.
 */
export function validateAttachment(file: AttachmentLike): ValidationErrorKey | null {
  const name = file.name.toLowerCase();
  const hasAllowedExtension = ATTACHMENT.extensions.some((extension) => name.endsWith(extension));
  const hasAllowedType = (ATTACHMENT.mimeTypes as readonly string[]).includes(file.type);

  if (!hasAllowedExtension || !hasAllowedType) {
    return "invalidFileType";
  }
  if (file.size > ATTACHMENT.maxSizeBytes) {
    return "fileTooLarge";
  }
  return null;
}
