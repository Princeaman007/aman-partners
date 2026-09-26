import { Briefcase, Code, Network, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TITLE_ID = "positioning-title";

/** Les trois piliers du positionnement (textes dans « AboutPage.positioning.items »). */
const PILLARS = [
  { key: "business", icon: Briefcase },
  { key: "technology", icon: Code },
  { key: "network", icon: Network },
] as const satisfies ReadonlyArray<{ key: string; icon: LucideIcon }>;

/** Section « Notre positionnement » de la page À propos. */
export async function AboutPositioning() {
  const t = await getTranslations("AboutPage.positioning");

  return (
    <section aria-labelledby={TITLE_ID} className="border-t border-border py-20 sm:py-28">
      <Container>
        <SectionHeading
          id={TITLE_ID}
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:mt-16">
          {PILLARS.map(({ key, icon: Icon }) => (
            <li key={key} className="bg-background p-6 sm:p-8">
              <Icon aria-hidden="true" strokeWidth={1.5} className="size-6" />
              <h3 className="mt-6 text-lg font-semibold tracking-tight">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`items.${key}.text`)}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
