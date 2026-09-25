import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/services": "/services",
    "/methode": { fr: "/methode", en: "/process" },
    "/realisations": { fr: "/realisations", en: "/work" },
    "/a-propos": { fr: "/a-propos", en: "/about" },
    "/contact": "/contact",
    "/demande-de-projet": { fr: "/demande-de-projet", en: "/start-a-project" },
    "/partenaires": { fr: "/partenaires", en: "/partners" },
    "/mentions-legales": { fr: "/mentions-legales", en: "/legal-notice" },
    "/confidentialite": { fr: "/confidentialite", en: "/privacy" },
    "/cookies": "/cookies",
  },
});

export type Locale = (typeof routing.locales)[number];
