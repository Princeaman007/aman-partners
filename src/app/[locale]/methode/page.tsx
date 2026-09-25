import { getTranslations, setRequestLocale } from "next-intl/server";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { PageHeader } from "@/components/sections/PageHeader";
import { TimelineSteps } from "@/components/sections/Timeline";
import { Container } from "@/components/ui/Container";

type MethodPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MethodPage({ params }: MethodPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("MethodPage");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <div className="border-t border-border py-20 sm:py-28">
        <Container>
          <TimelineSteps variant="detailed" headingLevel="h2" className="max-w-3xl" />
        </Container>
      </div>

      <FinalCTA />
    </>
  );
}
