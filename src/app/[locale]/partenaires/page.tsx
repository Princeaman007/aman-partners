import { Handshake } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Container";
import { createPageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = createPageMetadata("partners", "/partenaires");

type PartnersPageProps = {
  params: Promise<{ locale: string }>;
};

/** Arguments de l'encart « Pourquoi rejoindre le réseau » (textes dans « PartnersPage.why »). */
const WHY_ITEMS = ["qualified", "technical", "matching"] as const;

export default async function PartnersPage({ params }: PartnersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("PartnersPage");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <div className="border-t border-border py-16 sm:py-20">
        <Container className="grid gap-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <PartnerForm />
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-8 lg:sticky lg:top-28">
              <section
                aria-labelledby="partners-why-title"
                className="rounded-lg border border-border bg-surface p-6"
              >
                <h2 id="partners-why-title" className="text-base font-semibold tracking-tight">
                  {t("whyTitle")}
                </h2>
                <ul className="mt-5 space-y-4">
                  {WHY_ITEMS.map((key) => (
                    <li key={key} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground"
                      />
                      {t(`why.${key}`)}
                    </li>
                  ))}
                </ul>
              </section>

              <p className="flex gap-3 text-sm leading-relaxed text-muted">
                <Handshake
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="mt-0.5 size-5 shrink-0"
                />
                {t("commitment")}
              </p>
            </div>
          </aside>
        </Container>
      </div>
    </>
  );
}
