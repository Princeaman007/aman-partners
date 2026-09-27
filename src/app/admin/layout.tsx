import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { instrumentSerif, manrope } from "../fonts";
import "../globals.css";

/** Le dashboard est un outil interne, en français uniquement. */
const ADMIN_LOCALE = "fr";

type AdminLayoutProps = {
  children: ReactNode;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: ADMIN_LOCALE, namespace: "Admin" });

  return {
    title: `${t("metaTitle")} · Aman & Partners`,
    // Double sécurité avec l'en-tête X-Robots-Tag du proxy : jamais d'indexation.
    robots: { index: false, follow: false, nocache: true },
  };
}

/** Gabarit racine du dashboard : polices, styles et thème du site, sans header ni footer public. */
export default function AdminLayout({ children }: AdminLayoutProps) {
  setRequestLocale(ADMIN_LOCALE);

  return (
    <html
      lang={ADMIN_LOCALE}
      className={`${manrope.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <NextIntlClientProvider locale={ADMIN_LOCALE}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
