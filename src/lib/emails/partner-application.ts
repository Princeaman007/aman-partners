import "server-only";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/forms/server";
import type { EmailMessage } from "@/lib/services/email";
import type { PartnerApplicationData } from "@/lib/validation/partner-application";
import {
  EMAIL_COLORS,
  htmlDetails,
  htmlParagraph,
  renderEmailLayout,
  textDetails,
  type EmailDetail,
} from "./layout";

/** Libellés traduits du profil (statut, disponibilité, spécialités, expérience). */
async function describeProfile(data: PartnerApplicationData, locale: AppLocale) {
  const tForm = await getTranslations({ locale, namespace: "PartnerForm" });
  const tEmails = await getTranslations({ locale, namespace: "Emails" });

  return {
    status: tForm(`statuses.${data.status}`),
    availability: tForm(`availabilities.${data.availability}`),
    specialties: data.specialties
      .map((specialty) => tForm(`specialtyOptions.${specialty}`))
      .join(", "),
    experience: tEmails("partnerNotification.experienceValue", { years: data.experienceYears }),
  };
}

/** Détails communs aux deux e-mails : le profil du candidat. */
async function profileDetails(
  data: PartnerApplicationData,
  locale: AppLocale,
): Promise<EmailDetail[]> {
  const t = await getTranslations({ locale, namespace: "Emails" });
  const profile = await describeProfile(data, locale);

  return [
    { label: t("partnerNotification.status"), value: profile.status },
    { label: t("partnerNotification.availability"), value: profile.availability },
    { label: t("partnerNotification.specialties"), value: profile.specialties },
    { label: t("partnerNotification.technologies"), value: data.technologies },
    { label: t("partnerNotification.experienceYears"), value: profile.experience },
  ];
}

/** Accusé de réception envoyé au candidat, dans sa langue, avec le récapitulatif de son profil. */
export async function buildPartnerAcknowledgment(
  data: PartnerApplicationData,
  locale: AppLocale,
): Promise<EmailMessage> {
  const t = await getTranslations({ locale, namespace: "Emails" });
  const details = await profileDetails(data, locale);

  const greeting = t("partnerAck.greeting", { name: data.name });
  const body = t("partnerAck.body");
  const recap = t("partnerAck.recap");
  const signature = t("signature");
  const footer = t("footer");

  const content = [
    htmlParagraph(greeting),
    htmlParagraph(body),
    htmlParagraph(recap, EMAIL_COLORS.muted),
    htmlDetails(details),
    htmlParagraph(signature),
  ].join("");

  return {
    to: data.email,
    subject: t("partnerAck.subject"),
    text: [
      greeting,
      "",
      body,
      "",
      recap,
      "",
      textDetails(details),
      "",
      signature,
      "",
      "--",
      footer,
    ].join("\n"),
    html: renderEmailLayout({ preview: body, content, footer }),
  };
}

type NotificationParams = {
  data: PartnerApplicationData;
  /** Identifiant de la candidature en base, repris dans le dashboard. */
  requestId: string;
  locale: AppLocale;
  to: string;
};

/** Notification envoyée à Aman & Partners, toujours en français. */
export async function buildPartnerNotification({
  data,
  requestId,
  locale,
  to,
}: NotificationParams): Promise<EmailMessage> {
  const t = await getTranslations({ locale: "fr", namespace: "Emails" });
  const tLanguages = await getTranslations({ locale: "fr", namespace: "LanguageSwitcher" });

  const notProvided = t("notProvided");

  const details: EmailDetail[] = [
    { label: t("partnerNotification.name"), value: data.name },
    { label: t("partnerNotification.email"), value: data.email },
    { label: t("partnerNotification.country"), value: data.country },
    ...(await profileDetails(data, "fr")),
    { label: t("partnerNotification.dailyRate"), value: data.dailyRate || notProvided },
    { label: t("partnerNotification.portfolio"), value: data.portfolio || notProvided },
    { label: t("partnerNotification.linkedin"), value: data.linkedin || notProvided },
    { label: t("partnerNotification.github"), value: data.github || notProvided },
    { label: t("partnerNotification.language"), value: tLanguages(locale) },
    { label: t("partnerNotification.reference"), value: requestId },
  ];

  const intro = t("partnerNotification.intro");
  const reply = t("partnerNotification.reply", { name: data.name });
  const messageLabel = t("partnerNotification.message");
  const message = data.message || notProvided;

  const content = [
    htmlParagraph(intro),
    htmlDetails(details),
    htmlParagraph(messageLabel, EMAIL_COLORS.muted),
    `<blockquote style="margin:0 0 24px;padding:12px 16px;border-left:2px solid ${EMAIL_COLORS.text};">${htmlParagraph(message)}</blockquote>`,
    htmlParagraph(reply, EMAIL_COLORS.muted),
  ].join("");

  return {
    to,
    replyTo: data.email,
    subject: t("partnerNotification.subject", { name: data.name }),
    text: [intro, "", textDetails(details), "", `${messageLabel} :`, message, "", reply].join("\n"),
    html: renderEmailLayout({ preview: intro, content }),
  };
}
