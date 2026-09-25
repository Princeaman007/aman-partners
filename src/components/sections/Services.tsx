import { getTranslations } from "next-intl/server";
import { PRIMARY_CTA_HREF } from "@/components/layout/navigation";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SERVICES } from "@/content/services";

const TITLE_ID = "services-title";

export async function Services() {
  const t = await getTranslations("Services");
  const tNav = await getTranslations("Navigation");

  return (
    <section aria-labelledby={TITLE_ID} className="border-t border-border py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id={TITLE_ID}
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />
          <ArrowLink href="/services">{t("viewAll")}</ArrowLink>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {SERVICES.map(({ key, icon: Icon }) => (
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

          <li>
            <div className="flex h-full flex-col rounded-lg border border-border p-6 sm:p-8">
              <h3 className="text-lg font-semibold tracking-tight">{t("other.title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("other.text")}</p>
              <p className="mt-6 pt-2 lg:mt-auto">
                <ArrowLink href={PRIMARY_CTA_HREF}>{tNav("cta")}</ArrowLink>
              </p>
            </div>
          </li>
        </ul>
      </Container>
    </section>
  );
}
