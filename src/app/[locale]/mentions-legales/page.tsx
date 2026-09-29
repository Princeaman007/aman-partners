import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getLegalSections } from "@/lib/legal/document";
import { createPageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = createPageMetadata("legalNotice", "/mentions-legales");

type LegalNoticePageProps = {
  params: Promise<{ locale: string }>;
};

/** Mentions légales : éditeur, hébergement, propriété intellectuelle, droit applicable. */
export default async function LegalNoticePage({ params }: LegalNoticePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Legal.notice");
  const messages = await getMessages();

  return (
    <LegalDocument
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      sections={getLegalSections(messages, "notice")}
    />
  );
}
