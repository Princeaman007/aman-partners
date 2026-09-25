/** Liens de la navigation principale, partagés par le header, le menu mobile et le footer. */
export const MAIN_NAV = [
  { href: "/services", labelKey: "services" },
  { href: "/methode", labelKey: "method" },
  { href: "/realisations", labelKey: "work" },
  { href: "/a-propos", labelKey: "about" },
] as const;

/** Page vers laquelle mène le bouton principal « Parler de mon projet ». */
export const PRIMARY_CTA_HREF = "/demande-de-projet";

/** Page de candidature des freelances et agences partenaires. */
export const PARTNERS_HREF = "/partenaires";

/** Page de contact. */
export const CONTACT_HREF = "/contact";

/** Liens de la colonne Légal du footer (textes dans le bloc « Footer » des traductions). */
export const LEGAL_NAV = [
  { href: "/mentions-legales", labelKey: "legalNotice" },
  { href: "/confidentialite", labelKey: "privacy" },
  { href: "/cookies", labelKey: "cookies" },
] as const;
