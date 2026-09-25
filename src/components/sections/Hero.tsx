import { getTranslations } from "next-intl/server";
import { PRIMARY_CTA_HREF } from "@/components/layout/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroVisual } from "./HeroVisual";

const TITLE_ID = "hero-title";

export async function Hero() {
  const t = await getTranslations("Hero");
  const tNav = await getTranslations("Navigation");

  return (
    <section aria-labelledby={TITLE_ID} className="py-16 sm:py-24 lg:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="text-sm font-medium text-muted">{t("eyebrow")}</p>

          <h1
            id={TITLE_ID}
            className="mt-5 text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {t.rich("title", {
              accent: (chunks) => (
                <span className="font-serif font-normal tracking-normal italic">{chunks}</span>
              ),
            })}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t("subtitle")}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={PRIMARY_CTA_HREF} size="lg">
              {tNav("cta")}
            </ButtonLink>
            <ButtonLink href="/methode" variant="secondary" size="lg">
              {t("secondaryCta")}
            </ButtonLink>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm sm:max-w-md lg:col-span-5 lg:max-w-none">
          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}
