import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MAIN_CONTENT_ID, SkipLink } from "@/components/layout/SkipLink";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { TrackingScripts } from "@/components/layout/TrackingScripts";
import { JsonLd } from "@/components/seo/JsonLd";
import { routing } from "@/i18n/routing";
import { getSiteUrl, openGraphLocale } from "@/lib/seo/metadata";
import { buildSiteStructuredData } from "@/lib/seo/structured-data";
import { instrumentSerif, manrope } from "../fonts";
import "../globals.css";

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

type LocaleLayoutProps = LocaleParams & {
  children: ReactNode;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Métadonnées communes à toutes les pages ; chaque page complète son titre et sa description. */
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const appLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: appLocale, namespace: "Metadata" });
  const siteName = t("title");

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: siteName,
      // « Services » devient « Services | Aman & Partners ».
      template: `%s | ${siteName}`,
    },
    description: t("description"),
    applicationName: siteName,
    openGraph: {
      type: "website",
      siteName,
      locale: openGraphLocale(appLocale),
    },
    twitter: {
      card: "summary_large_image",
    },
    // Vérification Google Search Console (étape 7.4), si le code est renseigné.
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("Metadata");
  const structuredData = buildSiteStructuredData(locale, t("title"), t("description"));

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <JsonLd data={structuredData} />
        <NextIntlClientProvider>
          <SkipLink />
          <CookieBanner />
          <Header />
          <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
          <TrackingScripts />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
