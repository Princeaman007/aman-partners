import "server-only";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/forms/server";
import type { EmailAttachment, EmailMessage } from "@/lib/services/email";
import type { ProjectRequestData } from "@/lib/validation/project-request";
import {
  EMAIL_COLORS,
  htmlButton,
  htmlDetails,
  htmlParagraph,
  renderEmailLayout,
  textDetails,
  type EmailDetail,
} from "./layout";
import { adminRequestUrl } from "./links";
import { describeSource } from "./tracking";

/** Nom complet du demandeur. */
function fullName(data: ProjectRequestData): string {
  return `${data.firstName} ${data.lastName}`;
}

/** Libellés traduits des choix de la demande (type de projet, budget, délai, oui/non). */
async function describeChoices(data: ProjectRequestData, locale: AppLocale) {
  const t = await getTranslations({ locale, namespace: "ProjectRequestForm" });

  return {
    projectType: t(`projectTypes.${data.projectType}`),
    budget: t(`budgets.${data.budget}`),
    timeline: t(`timelines.${data.timeline}`),
    hasSpecifications: t(data.hasSpecifications),
    hasDesign: t(data.hasDesign),
    noAttachment: t("noAttachment"),
  };
}

function descriptionBlock(description: string): string {
  return `<blockquote style="margin:0 0 24px;padding:12px 16px;border-left:2px solid ${EMAIL_COLORS.text};">${htmlParagraph(description)}</blockquote>`;
}

/** Accusé de réception envoyé au visiteur, avec le récapitulatif de sa demande, dans sa langue. */
export async function buildProjectAcknowledgment(
  data: ProjectRequestData,
  locale: AppLocale,
  attachmentName: string | null,
): Promise<EmailMessage> {
  const t = await getTranslations({ locale, namespace: "Emails" });
  const choices = await describeChoices(data, locale);

  const greeting = t("projectAck.greeting", { name: data.firstName });
  const body = t("projectAck.body");
  const recap = t("projectAck.recap");
  const signature = t("signature");
  const footer = t("footer");

  const details: EmailDetail[] = [
    { label: t("projectNotification.projectType"), value: choices.projectType },
    { label: t("projectNotification.budget"), value: choices.budget },
    { label: t("projectNotification.timeline"), value: choices.timeline },
    { label: t("projectNotification.hasSpecifications"), value: choices.hasSpecifications },
    { label: t("projectNotification.hasDesign"), value: choices.hasDesign },
    {
      label: t("projectNotification.attachment"),
      value: attachmentName ?? choices.noAttachment,
    },
  ];

  const descriptionLabel = t("projectNotification.description");

  const content = [
    htmlParagraph(greeting),
    htmlParagraph(body),
    htmlParagraph(recap, EMAIL_COLORS.muted),
    htmlDetails(details),
    htmlParagraph(descriptionLabel, EMAIL_COLORS.muted),
    descriptionBlock(data.description),
    htmlParagraph(signature),
  ].join("");

  return {
    to: data.email,
    subject: t("projectAck.subject"),
    text: [
      greeting,
      "",
      body,
      "",
      recap,
      "",
      textDetails(details),
      "",
      `${descriptionLabel} :`,
      data.description,
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
  data: ProjectRequestData;
  /** Identifiant de la demande en base, repris dans le dashboard. */
  requestId: string;
  locale: AppLocale;
  to: string;
  /** Pièce jointe du visiteur, attachée à la notification. */
  attachment: EmailAttachment | null;
};

/** Notification envoyée à Aman & Partners, en français, avec la pièce jointe et le lien vers la fiche. */
export async function buildProjectNotification({
  data,
  requestId,
  locale,
  to,
  attachment,
}: NotificationParams): Promise<EmailMessage> {
  const t = await getTranslations({ locale: "fr", namespace: "Emails" });
  const tLanguages = await getTranslations({ locale: "fr", namespace: "LanguageSwitcher" });
  const choices = await describeChoices(data, "fr");

  const name = fullName(data);
  const notProvided = t("notProvided");
  const dashboardUrl = adminRequestUrl(requestId);
  const openLabel = t("openInDashboard");

  const details: EmailDetail[] = [
    { label: t("projectNotification.name"), value: name },
    { label: t("projectNotification.company"), value: data.company || notProvided },
    { label: t("projectNotification.email"), value: data.email },
    { label: t("projectNotification.phone"), value: data.phone || notProvided },
    { label: t("projectNotification.country"), value: data.country },
    { label: t("projectNotification.projectType"), value: choices.projectType },
    { label: t("projectNotification.budget"), value: choices.budget },
    { label: t("projectNotification.timeline"), value: choices.timeline },
    { label: t("projectNotification.hasSpecifications"), value: choices.hasSpecifications },
    { label: t("projectNotification.hasDesign"), value: choices.hasDesign },
    {
      label: t("projectNotification.attachment"),
      value: attachment
        ? t("projectNotification.attachmentIncluded", { name: attachment.filename })
        : choices.noAttachment,
    },
    { label: t("projectNotification.language"), value: tLanguages(locale) },
    {
      label: t("projectNotification.source"),
      value: describeSource(data.tracking) ?? notProvided,
    },
    { label: t("projectNotification.reference"), value: requestId },
  ];

  const intro = t("projectNotification.intro");
  const reply = t("projectNotification.reply", { name });
  const descriptionLabel = t("projectNotification.description");

  const content = [
    htmlParagraph(intro),
    htmlButton(dashboardUrl, openLabel),
    htmlDetails(details),
    htmlParagraph(descriptionLabel, EMAIL_COLORS.muted),
    descriptionBlock(data.description),
    htmlParagraph(reply, EMAIL_COLORS.muted),
  ].join("");

  return {
    to,
    replyTo: data.email,
    subject: t("projectNotification.subject", { name, projectType: choices.projectType }),
    text: [
      intro,
      "",
      `${openLabel} : ${dashboardUrl}`,
      "",
      textDetails(details),
      "",
      `${descriptionLabel} :`,
      data.description,
      "",
      reply,
    ].join("\n"),
    html: renderEmailLayout({ preview: intro, content }),
    attachments: attachment ? [attachment] : undefined,
  };
}
