import { getTranslations } from "next-intl/server";
import { BrandSymbol } from "@/components/brand/BrandSymbol";
import { PRIMARY_CTA_HREF } from "@/components/layout/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TITLE_ID = "final-cta-title";

export async function FinalCTA() {
  const t = await getTranslations("FinalCTA");

  return (
    <section aria-labelledby={TITLE_ID} className="py-20 sm:py-28">
      <Container>
        <div className="rounded-lg border border-border bg-surface px-6 py-16 text-center sm:px-12 sm:py-20">
          <BrandSymbol size={32} className="mx-auto" />

          <SectionHeading
            id={TITLE_ID}
            align="center"
            title={t.rich("title", {
              accent: (chunks) => (
                <span className="font-serif font-normal tracking-normal italic">{chunks}</span>
              ),
            })}
            description={t("description")}
            className="mt-8"
          />

          <ButtonLink href={PRIMARY_CTA_HREF} size="lg" className="mt-10">
            {t("button")}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
