/**
 * Identifiants des outils de mesure, lus dans les variables d'environnement publiques.
 * Un identifiant absent ou au format inattendu est ignoré : l'outil correspondant ne se charge pas.
 */

/** Vérifie le format d'un identifiant ; renvoie null s'il est absent ou invalide. */
function readId(value: string | undefined, pattern: RegExp): string | null {
  const trimmed = value?.trim();
  return trimmed && pattern.test(trimmed) ? trimmed : null;
}

export const TRACKING_IDS = {
  /** Propriété Google Analytics 4, par exemple G-ABC123XYZ9. */
  ga: readId(process.env.NEXT_PUBLIC_GA_ID, /^G-[A-Z0-9]{4,20}$/),
  /** Compte Google Ads, par exemple AW-123456789. */
  googleAds: readId(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID, /^AW-\d{6,15}$/),
  /** Libellé de la conversion « demande de projet » dans Google Ads. */
  googleAdsLeadLabel: readId(
    process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL,
    /^[A-Za-z0-9_-]{4,64}$/,
  ),
  /** Meta Pixel (Facebook et Instagram), un nombre de 10 à 20 chiffres. */
  metaPixel: readId(process.env.NEXT_PUBLIC_META_PIXEL_ID, /^\d{10,20}$/),
} as const;

/** La balise Google est utile si GA4 ou Google Ads est configuré. */
export const HAS_GOOGLE = TRACKING_IDS.ga !== null || TRACKING_IDS.googleAds !== null;

export const HAS_META = TRACKING_IDS.metaPixel !== null;

/** Durée des cookies Google Analytics : 13 mois (395 jours), en secondes. */
export const GA_COOKIE_EXPIRES = 60 * 60 * 24 * 395;
