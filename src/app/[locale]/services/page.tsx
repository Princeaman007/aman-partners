import { getTranslations, setRequestLocale } from "next-intl/server";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { PageHeader } from "@/components/sections/PageHeader";
import { ServiceList } from "@/components/sections/ServiceList";
import { createPageMetadata } from "@/lib/seo/metadata";
import { ServicesStructuredData } from "@/components/seo/ServicesStructuredData";

export const generateMetadata = createPageMetadata("services", "/services");

type ServicesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ServicesPage");

  return (
    <>
      <ServicesStructuredData />
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <ServiceList />
      <FinalCTA />
    </>
  );
}
