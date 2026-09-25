import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandSymbol } from "@/components/brand/BrandSymbol";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const SYMBOL_SIZES = [16, 24, 32, 48, 96] as const;
const LOGO_SIZES = ["sm", "md", "lg"] as const;
const BUTTON_SIZES = ["sm", "md", "lg"] as const;
const BADGE_VARIANTS = ["subtle", "outline"] as const;

type StyleguidePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function StyleguidePage({ params }: StyleguidePageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Styleguide");

  const demoCards = [
    { title: t("cardWebTitle"), text: t("cardWebText") },
    { title: t("cardMobileTitle"), text: t("cardMobileText") },
    { title: t("cardSaasTitle"), text: t("cardSaasText") },
  ];

  return (
    <main className="py-16">
      <Container>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("description")}</p>

        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight">{t("buttons")}</h2>
          <div className="mt-6 space-y-6 rounded-lg border border-border bg-surface p-8">
            {BUTTON_SIZES.map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-4">
                <span className="w-8 text-sm text-muted">{size}</span>
                <Button size={size}>{t("buttonPrimary")}</Button>
                <Button size={size} variant="secondary">
                  {t("buttonSecondary")}
                </Button>
                <Button size={size} variant="ghost">
                  {t("buttonGhost")}
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-4">
              <span className="w-8" />
              <Button disabled>{t("buttonDisabled")}</Button>
              <Button variant="secondary" disabled>
                {t("buttonDisabled")}
              </Button>
              <ButtonLink href="/" variant="secondary">
                {t("buttonLink")}
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight">{t("cards")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {demoCards.map((card) => (
              <Card key={card.title}>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.text}</CardDescription>
              </Card>
            ))}
          </div>
          <Card interactive className="mt-6">
            <CardDescription className="mt-0">{t("cardInteractive")}</CardDescription>
          </Card>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight">{t("badges")}</h2>
          <div className="mt-6 space-y-4 rounded-lg border border-border bg-surface p-8">
            {BADGE_VARIANTS.map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-2">
                <span className="w-16 text-sm text-muted">{variant}</span>
                <Badge variant={variant}>{t("badgeEcommerce")}</Badge>
                <Badge variant={variant}>{t("badgeSaas")}</Badge>
                <Badge variant={variant}>{t("badgePwa")}</Badge>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-16 text-sm text-muted">solid</span>
              <Badge variant="solid">{t("badgeLive")}</Badge>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight">{t("headings")}</h2>
          <div className="mt-6 space-y-16 rounded-lg border border-border bg-surface p-8 sm:p-12">
            <SectionHeading
              eyebrow={t("headingEyebrow")}
              title={t("headingTitle")}
              description={t("headingText")}
            />
            <SectionHeading
              align="center"
              eyebrow={t("headingCenterEyebrow")}
              title={t("headingCenterTitle")}
            />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight">{t("logo")}</h2>
          <div className="mt-6 flex flex-col items-start gap-8 rounded-lg border border-border bg-surface p-8">
            {LOGO_SIZES.map((size) => (
              <div key={size} className="flex items-center gap-6">
                <span className="w-8 text-sm text-muted">{size}</span>
                <Logo size={size} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight">{t("symbol")}</h2>
          <div className="mt-6 flex flex-wrap items-end gap-10 rounded-lg border border-border bg-surface p-8">
            {SYMBOL_SIZES.map((size) => (
              <div key={size} className="flex flex-col items-center gap-3">
                <BrandSymbol size={size} />
                <span className="text-sm text-muted">{size} px</span>
              </div>
            ))}
          </div>
        </section>
      </Container>

      <section className="mt-16">
        <Container>
          <h2 className="text-xl font-bold tracking-tight">{t("container")}</h2>
        </Container>
        <div className="mt-6 space-y-4">
          <Container>
            <div className="rounded-md border border-dashed border-border-strong p-4 text-sm text-muted">
              {t("containerDefault")}
            </div>
          </Container>
          <Container size="narrow">
            <div className="rounded-md border border-dashed border-border-strong p-4 text-sm text-muted">
              {t("containerNarrow")}
            </div>
          </Container>
        </div>
      </section>
    </main>
  );
}
