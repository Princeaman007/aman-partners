import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandSymbol } from "@/components/brand/BrandSymbol";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const SYMBOL_SIZES = [16, 24, 32, 48, 96] as const;
const LOGO_SIZES = ["sm", "md", "lg"] as const;

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

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("description")}</p>

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
    </main>
  );
}
