import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutPositioning } from "@/components/sections/AboutPositioning";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Founder } from "@/components/sections/Founder";
import { PageHeader } from "@/components/sections/PageHeader";
import { createPageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = createPageMetadata("about", "/a-propos");

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("AboutPage");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <AboutPositioning />
      <Founder />
      <FinalCTA />
    </>
  );
}
