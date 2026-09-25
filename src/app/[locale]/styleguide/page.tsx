import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandSymbol } from "@/components/brand/BrandSymbol";
import { Logo } from "@/components/brand/Logo";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Container } from "@/components/ui/Container";
import { FileUpload } from "@/components/ui/FileUpload";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const SYMBOL_SIZES = [16, 24, 32, 48, 96] as const;
const LOGO_SIZES = ["sm", "md", "lg"] as const;
const BUTTON_SIZES = ["sm", "md", "lg"] as const;
const BADGE_VARIANTS = ["subtle", "outline"] as const;
const BUDGET_OPTIONS = [
  { value: "under-1000", label: "budgetUnder1k" },
  { value: "1000-3000", label: "budget1kTo3k" },
  { value: "3000-5000", label: "budget3kTo5k" },
  { value: "5000-10000", label: "budget5kTo10k" },
  { value: "over-10000", label: "budgetOver10k" },
  { value: "unknown", label: "budgetUnknown" },
] as const;
const ATTACHMENT_ACCEPT = ".pdf,.docx,.png,.jpg,.jpeg";

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

  const consentLabel = t.rich("consentLabel", {
    link: (chunks) => (
      <Link
        href="/confidentialite"
        className="font-medium underline underline-offset-4 hover:no-underline"
      >
        {chunks}
      </Link>
    ),
  });

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
          <h2 className="text-xl font-bold tracking-tight">{t("forms")}</h2>
          <div className="mt-6 grid gap-8 rounded-lg border border-border bg-surface p-8 sm:grid-cols-2">
            <FormField id="demo-name" label={t("fieldName")} required>
              {(controlProps) => <Input {...controlProps} autoComplete="name" />}
            </FormField>
            <FormField
              id="demo-email"
              label={t("fieldEmail")}
              hint={t("fieldEmailHint")}
              error={t("fieldEmailError")}
              required
            >
              {(controlProps) => (
                <Input {...controlProps} type="email" autoComplete="email" defaultValue="nom@" />
              )}
            </FormField>
            <FormField id="demo-disabled" label={t("fieldDisabled")}>
              {(controlProps) => <Input {...controlProps} disabled />}
            </FormField>
            <FormField id="demo-budget" label={t("fieldBudget")} required>
              {(controlProps) => (
                <Select {...controlProps} placeholder={t("fieldBudgetPlaceholder")}>
                  {BUDGET_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.label)}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField
              id="demo-description"
              label={t("fieldDescription")}
              hint={t("fieldDescriptionHint")}
              required
              className="sm:col-span-2"
            >
              {(controlProps) => <Textarea {...controlProps} />}
            </FormField>
            <FileUpload
              id="demo-attachment"
              label={t("fieldAttachment")}
              hint={t("fieldAttachmentHint")}
              accept={ATTACHMENT_ACCEPT}
              className="sm:col-span-2"
            />
            <Checkbox id="demo-consent" label={consentLabel} required className="sm:col-span-2" />
            <Checkbox
              id="demo-consent-error"
              label={consentLabel}
              error={t("consentError")}
              required
              className="sm:col-span-2"
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
