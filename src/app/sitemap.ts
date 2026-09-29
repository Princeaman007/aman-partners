import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSiteUrl, type SiteHref } from "@/lib/seo/metadata";

/** Pages publiques du site, avec leur importance relative (indicative pour les moteurs). */
const PAGES: { href: SiteHref; priority: number }[] = [
  { href: "/", priority: 1 },
  { href: "/services", priority: 0.9 },
  { href: "/demande-de-projet", priority: 0.9 },
  { href: "/methode", priority: 0.8 },
  { href: "/realisations", priority: 0.8 },
  { href: "/a-propos", priority: 0.7 },
  { href: "/contact", priority: 0.7 },
  { href: "/partenaires", priority: 0.5 },
  { href: "/mentions-legales", priority: 0.2 },
  { href: "/confidentialite", priority: 0.2 },
  { href: "/cookies", priority: 0.2 },
];

/** Adresse complète d'une page (le sitemap exige des adresses absolues). */
function absoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString();
}

/** Plan du site : chaque page dans chaque langue, avec ses versions linguistiques. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ href, priority }) => {
    const languages: { [language: string]: string } = {};
    for (const locale of routing.locales) {
      languages[locale] = absoluteUrl(getPathname({ href, locale }));
    }

    return routing.locales.map((locale) => ({
      url: absoluteUrl(getPathname({ href, locale })),
      priority,
      alternates: { languages },
    }));
  });
}
