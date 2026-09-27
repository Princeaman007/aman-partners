import { getDb } from "@/lib/db/client";
import { requests } from "@/lib/db/schema";
import {
  buildPartnerAcknowledgment,
  buildPartnerNotification,
} from "@/lib/emails/partner-application";
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
import { checkRateLimit } from "@/lib/services/rate-limit";
import { verifyTurnstileToken } from "@/lib/services/turnstile";
import { partnerApplicationSchema } from "@/lib/validation/partner-application";

/** Réception des candidatures partenaires (freelances et agences). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const payload: Record<string, unknown> =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const locale = parseLocale(payload.locale);

  // 1. Champ piège rempli : c'est un robot. On répond « merci » sans rien enregistrer ni envoyer.
  if (typeof payload.website === "string" && payload.website !== "") {
    return successResponse();
  }

  try {
    const ip = getClientIp(request.headers);

    // 2. Limitation des envois par visiteur.
    const rateLimit = await checkRateLimit("partner", ip);
    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit.retryAfterSeconds);
    }

    // 3. Vérification anti-robots Turnstile.
    const token = typeof payload.turnstileToken === "string" ? payload.turnstileToken : null;
    if (!(await verifyTurnstileToken(token, ip))) {
      return captchaErrorResponse();
    }

    // 4. Validation avec le même schéma que le navigateur.
    const parsed = partnerApplicationSchema.safeParse(payload);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }
    const data = parsed.data;

    // 5. Enregistrement de la candidature, avec le statut « new » par défaut.
    const [created] = await getDb()
      .insert(requests)
      .values({
        type: "partner",
        name: data.name,
        email: data.email,
        country: data.country,
        locale,
        payload: {
          status: data.status,
          availability: data.availability,
          specialties: data.specialties,
          technologies: data.technologies,
          experienceYears: data.experienceYears,
          dailyRate: data.dailyRate,
          portfolio: data.portfolio,
          linkedin: data.linkedin,
          github: data.github,
          message: data.message,
          // Preuve du consentement RGPD : date et heure de l'accord.
          consentedAt: new Date().toISOString(),
        },
      })
      .returning({ id: requests.id });

    if (!created) {
      throw new Error("La candidature n'a pas pu être enregistrée.");
    }

    // 6. Envoi des deux e-mails. Un échec n'annule pas la candidature, déjà enregistrée.
    const results = await Promise.allSettled([
      buildPartnerNotification({
        data,
        requestId: created.id,
        locale,
        to: getNotificationRecipient(),
      }).then(sendEmail),
      buildPartnerAcknowledgment(data, locale).then(sendEmail),
    ]);

    for (const result of results) {
      if (result.status === "rejected") {
        console.error("[partner-application] Envoi d'un e-mail échoué :", result.reason);
      }
    }

    return successResponse();
  } catch (error) {
    console.error("[partner-application] Erreur inattendue :", error);
    return serverErrorResponse();
  }
}
