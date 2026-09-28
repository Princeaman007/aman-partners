import { getDb } from "@/lib/db/client";
import { requests, type StoredAttachment } from "@/lib/db/schema";
import { buildProjectAcknowledgment, buildProjectNotification } from "@/lib/emails/project-request";
import {
  captchaErrorResponse,
  fieldErrorsResponse,
  parseLocale,
  rateLimitedResponse,
  readFormJson,
  readFormText,
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/forms/server";
import { getClientIp } from "@/lib/services/client-ip";
import { getNotificationRecipient, sendEmail, type EmailAttachment } from "@/lib/services/email";
import { resolveEventId, sendMetaConversion } from "@/lib/services/meta-capi";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { inspectAttachment, uploadAttachment } from "@/lib/services/storage";
import { verifyTurnstileToken } from "@/lib/services/turnstile";
import {
  projectContactStepSchema,
  projectDetailsStepSchema,
  projectRequestSchema,
} from "@/lib/validation/project-request";

/** Champs texte du formulaire, déduits des schémas des deux premières étapes. */
const TEXT_FIELDS = [
  ...Object.keys(projectContactStepSchema.shape),
  ...Object.keys(projectDetailsStepSchema.shape),
];

/** Réception du formulaire de demande de projet (multipart, avec pièce jointe facultative). */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    formData = new FormData();
  }

  const locale = parseLocale(readFormText(formData, "locale"));

  // 1. Champ piège rempli : c'est un robot. On répond « merci » sans rien enregistrer ni envoyer.
  const honeypot = readFormText(formData, "website");
  if (honeypot) {
    return successResponse();
  }

  try {
    const ip = getClientIp(request.headers);

    // 2. Limitation des envois par visiteur.
    const rateLimit = await checkRateLimit("project", ip);
    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit.retryAfterSeconds);
    }

    // 3. Vérification anti-robots Turnstile.
    const token = readFormText(formData, "turnstileToken") ?? null;
    if (!(await verifyTurnstileToken(token, ip))) {
      return captchaErrorResponse();
    }

    // 4. Validation des champs avec le même schéma que le navigateur.
    const payload: { [key: string]: unknown } = {
      consent: readFormText(formData, "consent") === "true",
      tracking: readFormJson(formData, "tracking"),
    };
    for (const field of TEXT_FIELDS) {
      payload[field] = readFormText(formData, field) ?? "";
    }

    const parsed = projectRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }
    const data = parsed.data;

    // 5. Vérification de la pièce jointe (facultative) : nom, type, taille et contenu réel.
    const file = formData.get("attachment");
    let storedAttachment: StoredAttachment | null = null;
    let emailAttachment: EmailAttachment | null = null;

    if (file instanceof File && file.size > 0) {
      const inspection = await inspectAttachment(file);
      if (!inspection.ok) {
        return fieldErrorsResponse({ attachment: inspection.error });
      }

      // 6. Enregistrement du fichier sur le stockage, sous un nom aléatoire.
      storedAttachment = await uploadAttachment({
        folder: "project-requests",
        buffer: inspection.buffer,
        mimeType: inspection.mimeType,
        name: inspection.name,
      });
      emailAttachment = {
        filename: inspection.name,
        content: inspection.buffer,
        contentType: inspection.mimeType,
      };
    }

    // 7. Enregistrement de la demande, avec le statut « new » par défaut.
    const [created] = await getDb()
      .insert(requests)
      .values({
        type: "project",
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        company: data.company || null,
        phone: data.phone || null,
        country: data.country,
        locale,
        payload: {
          firstName: data.firstName,
          lastName: data.lastName,
          projectType: data.projectType,
          description: data.description,
          budget: data.budget,
          timeline: data.timeline,
          hasSpecifications: data.hasSpecifications,
          hasDesign: data.hasDesign,
          // Preuve du consentement RGPD : date et heure de l'accord.
          consentedAt: new Date().toISOString(),
        },
        attachment: storedAttachment,
        tracking: data.tracking ?? null,
      })
      .returning({ id: requests.id });

    if (!created) {
      throw new Error("La demande n'a pas pu être enregistrée.");
    }

    // 8. E-mails et conversion Meta (serveur), en parallèle. Un échec n'annule pas la demande.
    const results = await Promise.allSettled([
      buildProjectNotification({
        data,
        requestId: created.id,
        locale,
        to: getNotificationRecipient(),
        attachment: emailAttachment,
      }).then(sendEmail),
      buildProjectAcknowledgment(data, locale, storedAttachment?.name ?? null).then(sendEmail),
      sendMetaConversion(request, {
        eventName: "Lead",
        eventId: resolveEventId(readFormText(formData, "eventId")),
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        tracking: data.tracking,
      }),
    ]);

    for (const result of results) {
      if (result.status === "rejected") {
        console.error(
          "[project-request] Envoi d'un e-mail ou de la conversion Meta échoué :",
          result.reason,
        );
      }
    }

    return successResponse();
  } catch (error) {
    console.error("[project-request] Erreur inattendue :", error);
    return serverErrorResponse();
  }
}
