import { getTranslations, setRequestLocale } from "next-intl/server";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { PageHeader } from "@/components/sections/PageHeader";
import { ProjectCaseStudies } from "@/components/sections/ProjectCaseStudies";
import { Container } from "@/components/ui/Container";
import { createPageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = createPageMetadata("work", "/realisations");

type WorkPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function WorkPage({ params }: WorkPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("WorkPage");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <div className="border-t border-border py-20 sm:py-28">
        <Container>
          <ProjectCaseStudies />
        </Container>
      </div>

      <FinalCTA />
    </>
  );
}
