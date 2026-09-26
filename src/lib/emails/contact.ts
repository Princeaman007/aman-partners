import "server-only";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/forms/server";
import type { EmailMessage } from "@/lib/services/email";
import type { ContactData } from "@/lib/validation/contact";
import {
  EMAIL_COLORS,
  htmlDetails,
  htmlParagraph,
  renderEmailLayout,
  textDetails,
  type EmailDetail,
} from "./layout";

/** Origine de la demande d'après les paramètres de campagne, ou null si elle est inconnue. */
function describeSource(tracking: ContactData["tracking"]): string | null {
  if (!tracking) {
    return null;
  }
  const parts = [tracking.utm_source, tracking.utm_medium, tracking.utm_campaign].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : null;
}

/** Accusé de réception envoyé au visiteur, dans la langue du site au moment de l'envoi. */
export async function buildContactAcknowledgment(
  data: ContactData,
  locale: AppLocale,
): Promise<EmailMessage> {
  const t = await getTranslations({ locale, namespace: "Emails" });

  const greeting = t("contactAck.greeting", { name: data.name });
  const body = t("contactAck.body");
  const recap = t("contactAck.recap");
  const signature = t("signature");
  const footer = t("footer");

  const content = [
    htmlParagraph(greeting),
    htmlParagraph(body),
    htmlParagraph(recap, EMAIL_COLORS.muted),
    `<blockquote style="margin:0 0 24px;padding:12px 16px;border-left:2px solid ${EMAIL_COLORS.text};">${htmlParagraph(data.message)}</blockquote>`,
    htmlParagraph(signature),
  ].join("");

  return {
    to: data.email,
    subject: t("contactAck.subject"),
    text: [greeting, "", body, "", recap, "", data.message, "", signature, "", "--", footer].join(
      "\n",
    ),
    html: renderEmailLayout({ preview: body, content, footer }),
  };
}

type NotificationParams = {
  data: ContactData;
  /** Identifiant de la demande en base, repris dans le dashboard. */
  requestId: string;
  locale: AppLocale;
  to: string;
};

/** Notification envoyée à Aman & Partners, toujours en français. */
export async function buildContactNotification({
  data,
  requestId,
  locale,
  to,
}: NotificationParams): Promise<EmailMessage> {
  const t = await getTranslations({ locale: "fr", namespace: "Emails" });
  const tLanguages = await getTranslations({ locale: "fr", namespace: "LanguageSwitcher" });

  const notProvided = t("notProvided");

  const details: EmailDetail[] = [
    { label: t("contactNotification.name"), value: data.name },
    { label: t("contactNotification.company"), value: data.company || notProvided },
    { label: t("contactNotification.email"), value: data.email },
    { label: t("contactNotification.phone"), value: data.phone || notProvided },
    { label: t("contactNotification.language"), value: tLanguages(locale) },
    {
      label: t("contactNotification.source"),
      value: describeSource(data.tracking) ?? notProvided,
    },
    { label: t("contactNotification.reference"), value: requestId },
  ];

  const intro = t("contactNotification.intro");
  const reply = t("contactNotification.reply", { name: data.name });
  const messageLabel = t("contactNotification.message");

  const content = [
    htmlParagraph(intro),
    htmlDetails(details),
    htmlParagraph(messageLabel, EMAIL_COLORS.muted),
    `<blockquote style="margin:0 0 24px;padding:12px 16px;border-left:2px solid ${EMAIL_COLORS.text};">${htmlParagraph(data.message)}</blockquote>`,
    htmlParagraph(reply, EMAIL_COLORS.muted),
  ].join("");

  return {
    to,
    replyTo: data.email,
    subject: t("contactNotification.subject", { name: data.name }),
    text: [intro, "", textDetails(details), "", `${messageLabel} :`, data.message, "", reply].join(
      "\n",
    ),
    html: renderEmailLayout({ preview: intro, content }),
  };
}
