import type { ReactNode } from "react";
import Link from "next/link";
import ExternalLink from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { NoteForm, StatusForm } from "@/components/admin/RequestActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { toPhoneHref } from "@/content/company";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDateTime, formatFileSize, toIsoString } from "@/lib/admin/format";
import { ADMIN_REQUESTS_PATH } from "@/lib/admin/request-filters";
import { getRequestById, listRequestNotes } from "@/lib/admin/requests";
import { STATUSES_BY_TYPE } from "@/lib/db/schema";
import {
  AVAILABILITIES,
  PARTNER_STATUSES,
  SPECIALTIES,
} from "@/lib/validation/partner-application";
import { BUDGET_RANGES, PROJECT_TYPES, TIMELINES, YES_NO } from "@/lib/validation/project-request";

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

type Payload = Record<string, unknown>;

/** Paramètres de campagne reconnus, avec un libellé dans « Admin.detail.utm ». */
const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

/** Lit un texte non vide dans le contenu de la demande. */
function readString(payload: Payload, key: string): string | null {
  const value = payload[key];
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/** Indique si une valeur appartient à une liste fermée. */
function isOneOf<Value extends string>(values: readonly Value[], value: unknown): value is Value {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}

/** Adresse web affichable comme lien : uniquement http ou https. */
function isWebUrl(value: string | null): value is string {
  return value !== null && /^https?:\/\//i.test(value);
}

const CARD_CLASSES = "rounded-lg border border-border bg-background p-5 sm:p-6";

const LINK_CLASSES =
  "rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

const ACTION_LINK_CLASSES =
  "inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors duration-150 hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

const DOWNLOAD_LINK_CLASSES =
  "inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/** Section de la fiche, avec son titre. */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={CARD_CLASSES}>
      <h2 id={id} className="text-base font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Une information de la fiche : libellé et valeur. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm break-words sm:col-span-2">{children}</dd>
    </div>
  );
}

/** Fiche d'une demande : informations, pièce jointe, origine, statut et notes. */
export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  await requireAdmin();

  const { id } = await params;
  const record = await getRequestById(id);
  if (!record) {
    notFound();
  }

  const notes = await listRequestNotes(record.id);

  const t = await getTranslations({ locale: "fr", namespace: "Admin" });
  const tEmails = await getTranslations({ locale: "fr", namespace: "Emails" });
  const tProject = await getTranslations({ locale: "fr", namespace: "ProjectRequestForm" });
  const tPartner = await getTranslations({ locale: "fr", namespace: "PartnerForm" });
  const tLanguages = await getTranslations({ locale: "fr", namespace: "LanguageSwitcher" });

  const payload: Payload = record.payload;
  const notProvided = tEmails("notProvided");
  const consentedAt = readString(payload, "consentedAt");
  const trackingEntries = Object.entries(record.tracking ?? {}).filter(
    ([, value]) => typeof value === "string" && value !== "",
  );

  const mailtoHref = `mailto:${record.email}`;
  const phoneHref = record.phone ? toPhoneHref(record.phone) : null;
  const downloadHref = `${ADMIN_REQUESTS_PATH}/${record.id}/piece-jointe`;

  // Contenu propre au type de demande.
  let content: ReactNode;

  if (record.type === "project") {
    const projectType = payload.projectType;
    const budget = payload.budget;
    const timeline = payload.timeline;
    const hasSpecifications = payload.hasSpecifications;
    const hasDesign = payload.hasDesign;

    content = (
      <dl className="divide-y divide-border">
        <Field label={tEmails("projectNotification.projectType")}>
          {isOneOf(PROJECT_TYPES, projectType)
            ? tProject(`projectTypes.${projectType}`)
            : notProvided}
        </Field>
        <Field label={tEmails("projectNotification.budget")}>
          {isOneOf(BUDGET_RANGES, budget) ? tProject(`budgets.${budget}`) : notProvided}
        </Field>
        <Field label={tEmails("projectNotification.timeline")}>
          {isOneOf(TIMELINES, timeline) ? tProject(`timelines.${timeline}`) : notProvided}
        </Field>
        <Field label={tEmails("projectNotification.hasSpecifications")}>
          {isOneOf(YES_NO, hasSpecifications) ? tProject(hasSpecifications) : notProvided}
        </Field>
        <Field label={tEmails("projectNotification.hasDesign")}>
          {isOneOf(YES_NO, hasDesign) ? tProject(hasDesign) : notProvided}
        </Field>
        <Field label={tEmails("projectNotification.description")}>
          <p className="whitespace-pre-line">{readString(payload, "description") ?? notProvided}</p>
        </Field>
      </dl>
    );
  } else if (record.type === "partner") {
    const partnerStatus = payload.status;
    const availability = payload.availability;
    const specialties = Array.isArray(payload.specialties)
      ? payload.specialties.filter((value): value is (typeof SPECIALTIES)[number] =>
          isOneOf(SPECIALTIES, value),
        )
      : [];
    const experienceYears =
      typeof payload.experienceYears === "number" ? payload.experienceYears : null;
    const links = [
      { label: tEmails("partnerNotification.portfolio"), value: readString(payload, "portfolio") },
      { label: tEmails("partnerNotification.linkedin"), value: readString(payload, "linkedin") },
      { label: tEmails("partnerNotification.github"), value: readString(payload, "github") },
    ];

    content = (
      <dl className="divide-y divide-border">
        <Field label={tEmails("partnerNotification.status")}>
          {isOneOf(PARTNER_STATUSES, partnerStatus)
            ? tPartner(`statuses.${partnerStatus}`)
            : notProvided}
        </Field>
        <Field label={tEmails("partnerNotification.availability")}>
          {isOneOf(AVAILABILITIES, availability)
            ? tPartner(`availabilities.${availability}`)
            : notProvided}
        </Field>
        <Field label={tEmails("partnerNotification.specialties")}>
          {specialties.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <li key={specialty}>
                  <Badge variant="outline">{tPartner(`specialtyOptions.${specialty}`)}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            notProvided
          )}
        </Field>
        <Field label={tEmails("partnerNotification.technologies")}>
          {readString(payload, "technologies") ?? notProvided}
        </Field>
        <Field label={tEmails("partnerNotification.experienceYears")}>
          {experienceYears === null
            ? notProvided
            : tEmails("partnerNotification.experienceValue", { years: experienceYears })}
        </Field>
        <Field label={tEmails("partnerNotification.dailyRate")}>
          {readString(payload, "dailyRate") ?? notProvided}
        </Field>
        {links.map(({ label, value }) => (
          <Field key={label} label={label}>
            {isWebUrl(value) ? (
              <ExternalLink
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
                className={LINK_CLASSES}
              >
                {value}
              </ExternalLink>
            ) : (
              notProvided
            )}
          </Field>
        ))}
        <Field label={tEmails("partnerNotification.message")}>
          <p className="whitespace-pre-line">{readString(payload, "message") ?? notProvided}</p>
        </Field>
      </dl>
    );
  } else {
    content = (
      <p className="text-sm leading-relaxed whitespace-pre-line">
        {readString(payload, "message") ?? notProvided}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête de la fiche */}
      <header className="space-y-4">
        <Link
          href={ADMIN_REQUESTS_PATH}
          className="inline-flex items-center gap-2 rounded-sm text-sm text-muted transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="size-4" />
          {t("detail.back")}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight break-words">{record.name}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{t(`types.${record.type}`)}</Badge>
          <StatusBadge status={record.status} />
          <p className="text-sm text-muted">
            <time dateTime={toIsoString(record.createdAt)}>
              {t("detail.receivedAt", { date: formatDateTime(record.createdAt) })}
            </time>
          </p>
        </div>
        <p className="text-xs text-muted">
          {t("detail.reference")} : <span className="font-mono">{record.id}</span>
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Informations */}
        <div className="space-y-6 lg:col-span-2">
          <Section id="detail-contact" title={t("detail.contactTitle")}>
            <dl className="divide-y divide-border">
              <Field label={t("detail.email")}>
                <a href={mailtoHref} className={LINK_CLASSES}>
                  {record.email}
                </a>
              </Field>
              <Field label={t("detail.phone")}>
                {record.phone && phoneHref ? (
                  <a href={phoneHref} className={LINK_CLASSES}>
                    {record.phone}
                  </a>
                ) : (
                  notProvided
                )}
              </Field>
              <Field label={t("detail.company")}>{record.company ?? notProvided}</Field>
              <Field label={t("detail.country")}>{record.country ?? notProvided}</Field>
              <Field label={t("detail.language")}>
                {record.locale === "fr" || record.locale === "en"
                  ? tLanguages(record.locale)
                  : record.locale}
              </Field>
            </dl>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={mailtoHref} className={ACTION_LINK_CLASSES}>
                <Mail aria-hidden="true" strokeWidth={1.5} className="size-4" />
                {t("detail.writeEmail")}
              </a>
              {phoneHref ? (
                <a href={phoneHref} className={ACTION_LINK_CLASSES}>
                  <Phone aria-hidden="true" strokeWidth={1.5} className="size-4" />
                  {t("detail.call")}
                </a>
              ) : null}
            </div>
          </Section>

          <Section id="detail-content" title={t("detail.requestTitle")}>
            {content}
          </Section>

          {record.type === "project" ? (
            <Section id="detail-attachment" title={t("detail.attachmentTitle")}>
              {record.attachment ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium break-all">{record.attachment.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatFileSize(record.attachment.size)} · {t("detail.downloadHint")}
                    </p>
                  </div>
                  <a href={downloadHref} className={DOWNLOAD_LINK_CLASSES}>
                    <Download aria-hidden="true" strokeWidth={1.5} className="size-4" />
                    {t("detail.download")}
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted">{t("detail.noAttachment")}</p>
              )}
            </Section>
          ) : null}

          <Section id="detail-origin" title={t("detail.originTitle")}>
            {trackingEntries.length > 0 ? (
              <dl className="divide-y divide-border">
                {trackingEntries.map(([key, value]) => (
                  <Field
                    key={key}
                    label={isOneOf(TRACKING_KEYS, key) ? t(`detail.utm.${key}`) : key}
                  >
                    {String(value)}
                  </Field>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted">{t("detail.noOrigin")}</p>
            )}
          </Section>

          <Section id="detail-consent" title={t("detail.consentTitle")}>
            <p className="text-sm text-muted">
              {consentedAt
                ? t("detail.consentedAt", { date: formatDateTime(new Date(consentedAt)) })
                : t("detail.noConsentDate")}
            </p>
          </Section>
        </div>

        {/* Actions : statut et notes */}
        <aside className="space-y-6">
          <Section id="detail-status" title={t("detail.statusTitle")}>
            <StatusForm
              requestId={record.id}
              currentStatus={record.status}
              options={STATUSES_BY_TYPE[record.type]}
            />
          </Section>

          <Section id="detail-notes" title={t("detail.notesTitle")}>
            <p className="-mt-2 mb-4 text-xs text-muted">{t("detail.notesHint")}</p>
            {notes.length > 0 ? (
              <ol className="mb-6 space-y-4">
                {notes.map((note) => (
                  <li key={note.id} className="border-l-2 border-foreground pl-4">
                    <p className="text-xs text-muted">
                      <time dateTime={toIsoString(note.createdAt)}>
                        {formatDateTime(note.createdAt)}
                      </time>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">{note.body}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mb-6 text-sm text-muted">{t("detail.noNotes")}</p>
            )}
            <NoteForm requestId={record.id} />
          </Section>
        </aside>
      </div>
    </div>
  );
}
