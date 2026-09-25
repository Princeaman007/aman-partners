import { Clock, Scale, Search, ShieldAlert, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TITLE_ID = "problems-title";

/** Les quatre problèmes, dans l'ordre du cahier des charges (textes dans « Problems.items »). */
const PROBLEMS = [
  { key: "contact", icon: Search },
  { key: "quotes", icon: Scale },
  { key: "time", icon: Clock },
  { key: "provider", icon: ShieldAlert },
] as const satisfies ReadonlyArray<{ key: string; icon: LucideIcon }>;

export async function Problems() {
  const t = await getTranslations("Problems");

  return (
    <section aria-labelledby={TITLE_ID} className="border-t border-border py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <SectionHeading
          id={TITLE_ID}
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start"
        />

        <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
          {PROBLEMS.map(({ key, icon: Icon }) => (
            <li key={key}>
              <Card className="h-full">
                <span className="flex size-10 items-center justify-center rounded-md border border-border">
                  <Icon aria-hidden="true" strokeWidth={1.5} className="size-5" />
                </span>
                <CardTitle className="mt-5">{t(`items.${key}.title`)}</CardTitle>
                <CardDescription>{t(`items.${key}.text`)}</CardDescription>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
