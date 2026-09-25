/** Liens de la navigation principale, partagés par le header, le menu mobile et le footer. */
export const MAIN_NAV = [
  { href: "/services", labelKey: "services" },
  { href: "/methode", labelKey: "method" },
  { href: "/realisations", labelKey: "work" },
  { href: "/a-propos", labelKey: "about" },
] as const;

/** Page vers laquelle mène le bouton principal « Parler de mon projet ». */
export const PRIMARY_CTA_HREF = "/demande-de-projet";
