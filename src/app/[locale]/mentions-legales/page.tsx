import type { Metadata } from "next";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getLegalSections } from "@/lib/legal/document";

type LegalNoticePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LegalNoticePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal.notice" });

  return { title: t("title"), description: t("description") };
}

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
