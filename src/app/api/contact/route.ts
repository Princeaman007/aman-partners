import { getDb } from "@/lib/db/client";
import { requests } from "@/lib/db/schema";
import { buildContactAcknowledgment, buildContactNotification } from "@/lib/emails/contact";
import {
  captchaErrorResponse,
  parseLocale,
  rateLimitedResponse,
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/forms/server";
import { getClientIp } from "@/lib/services/client-ip";
import { getNotificationRecipient, sendEmail } from "@/lib/services/email";
import { resolveEventId, sendMetaConversion } from "@/lib/services/meta-capi";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { verifyTurnstileToken } from "@/lib/services/turnstile";
import { contactSchema } from "@/lib/validation/contact";

/** Réception du formulaire de contact. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const payload: { [key: string]: unknown } =
    typeof body === "object" && body !== null ? (body as { [key: string]: unknown }) : {};
  const locale = parseLocale(payload.locale);

  // 1. Champ piège rempli : c'est un robot. On répond « merci » sans rien enregistrer ni envoyer.
  if (typeof payload.website === "string" && payload.website !== "") {
    return successResponse();
  }

  try {
    const ip = getClientIp(request.headers);

    // 2. Limitation des envois par visiteur.
    const rateLimit = await checkRateLimit("contact", ip);
    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit.retryAfterSeconds);
    }

    // 3. Vérification anti-robots Turnstile.
    const token = typeof payload.turnstileToken === "string" ? payload.turnstileToken : null;
    if (!(await verifyTurnstileToken(token, ip))) {
      return captchaErrorResponse();
    }

    // 4. Validation avec le même schéma que le navigateur.
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }
    const data = parsed.data;

    // 5. Enregistrement de la demande, avec le statut « new » par défaut.
    const [created] = await getDb()
      .insert(requests)
      .values({
        type: "contact",
        name: data.name,
        email: data.email,
        company: data.company || null,
        phone: data.phone || null,
        locale,
        payload: {
          message: data.message,
          // Preuve du consentement RGPD : date et heure de l'accord.
          consentedAt: new Date().toISOString(),
        },
        tracking: data.tracking ?? null,
      })
      .returning({ id: requests.id });

    if (!created) {
      throw new Error("La demande n'a pas pu être enregistrée.");
    }

    // 6. E-mails et conversion Meta (serveur), en parallèle. Un échec n'annule pas la demande.
    const results = await Promise.allSettled([
      buildContactNotification({
        data,
        requestId: created.id,
        locale,
        to: getNotificationRecipient(),
      }).then(sendEmail),
      buildContactAcknowledgment(data, locale).then(sendEmail),
      sendMetaConversion(request, {
        eventName: "Contact",
        eventId: resolveEventId(payload.eventId),
        email: data.email,
        phone: data.phone,
        tracking: data.tracking,
      }),
    ]);

    for (const result of results) {
      if (result.status === "rejected") {
        console.error(
          "[contact] Envoi d'un e-mail ou de la conversion Meta échoué :",
          result.reason,
        );
      }
    }

    return successResponse();
  } catch (error) {
    console.error("[contact] Erreur inattendue :", error);
    return serverErrorResponse();
  }
}
