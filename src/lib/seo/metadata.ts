import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type AppLocale = (typeof routing.locales)[number];

/** Une route du site, telle que déclarée dans routing.ts (par exemple "/services"). */
export type SiteHref = Parameters<typeof getPathname>[0]["href"];

/** Pages dont le titre et la description sont définis dans les textes SEO (bloc « Seo »). */
export type SeoPage =
  | "home"
  | "services"
  | "method"
  | "work"
  | "about"
  | "contact"
  | "projectRequest"
  | "partners"
  | "legalNotice"
  | "privacy"
  | "cookies";

type PageMetadataProps = {
  params: Promise<{ locale: string }>;
};

/** Adresse publique du site (localhost en développement). */
export function getSiteUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
}

/** Code de langue et de région pour Open Graph. */
export function openGraphLocale(locale: AppLocale): string {
  return locale === "fr" ? "fr_BE" : "en_GB";
}

/** Image de partage de la langue (générée à la construction du site, 1200 × 630). */
export function openGraphImage(locale: AppLocale, alt: string) {
  return { url: `/api/og/${locale}`, width: 1200, height: 630, alt, type: "image/png" };
}

/**
 * Adresse canonique de la page et ses versions dans chaque langue (hreflang).
 * Les adresses sont relatives : metadataBase, défini dans le gabarit, les complète.
 */
export function buildAlternates(href: SiteHref, locale: AppLocale): Metadata["alternates"] {
  const languages: { [language: string]: string } = {};

  for (const language of routing.locales) {
    languages[language] = getPathname({ href, locale: language });
  }
  // Version proposée par défaut aux visiteurs dont la langue n'est pas prévue.
  languages["x-default"] = getPathname({ href, locale: routing.defaultLocale });

  return {
    canonical: getPathname({ href, locale }),
    languages,
  };
}

/**
 * Fabrique la fonction generateMetadata d'une page : titre, description, adresse canonique,
 * versions linguistiques (hreflang), Open Graph et image de partage, à partir des textes SEO.
 */
export function createPageMetadata(page: SeoPage, href: SiteHref) {
  return async function generateMetadata({ params }: PageMetadataProps): Promise<Metadata> {
    const { locale } = await params;
    const appLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
    const t = await getTranslations({ locale: appLocale, namespace: "Seo" });
    const tSite = await getTranslations({ locale: appLocale, namespace: "Metadata" });

    const siteName = tSite("title");
    const title = t(`${page}.title`);
    const description = t(`${page}.description`);
    const image = openGraphImage(appLocale, siteName);

    return {
      // La page d'accueil a son propre titre complet ; les autres suivent le modèle du gabarit.
      title: page === "home" ? { absolute: title } : title,
      description,
      alternates: buildAlternates(href, appLocale),
      openGraph: {
        type: "website",
        siteName,
        locale: openGraphLocale(appLocale),
        title,
        description,
        url: getPathname({ href, locale: appLocale }),
        images: [image],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image.url],
      },
    };
  };
}
