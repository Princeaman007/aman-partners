import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getLegalSections } from "@/lib/legal/document";
import { createPageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = createPageMetadata("privacy", "/confidentialite");

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

/** Politique de confidentialité : données, finalités, sous-traitants, conservation et droits. */
export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Legal.privacy");
  const messages = await getMessages();

  return (
    <LegalDocument
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      sections={getLegalSections(messages, "privacy")}
    />
  );
}
