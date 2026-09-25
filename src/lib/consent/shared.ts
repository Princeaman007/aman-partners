/** Nom du cookie qui enregistre le choix du visiteur. */
export const CONSENT_COOKIE = "ap_consent";

/**
 * Version de la liste des catégories. À incrémenter si on ajoute ou retire une catégorie :
 * les choix enregistrés avec une ancienne version sont ignorés et la bannière réapparaît.
 */
export const CONSENT_VERSION = 1;

/** Durée de conservation du choix : environ 6 mois, en secondes. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 182;

/** Catégories soumises au consentement (les cookies nécessaires n'en ont pas besoin). */
export const CONSENT_CATEGORIES = ["analytics", "advertising"] as const;

export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

export type ConsentChoices = Record<ConsentCategory, boolean>;

export type ConsentState = ConsentChoices & {
  version: number;
  updatedAt: string;
};

export const ACCEPT_ALL: ConsentChoices = { analytics: true, advertising: true };
export const REJECT_ALL: ConsentChoices = { analytics: false, advertising: false };

/** Lit la valeur brute du cookie. Renvoie null si elle est absente, illisible ou d'une ancienne version. */
export function parseConsent(raw: string | null | undefined): ConsentState | null {
  if (!raw) {
    return null;
  }

  try {
    const data: unknown = JSON.parse(decodeURIComponent(raw));

    if (typeof data !== "object" || data === null) {
      return null;
    }

    const { version, updatedAt, analytics, advertising } = data as Record<string, unknown>;

    if (
      version !== CONSENT_VERSION ||
      typeof updatedAt !== "string" ||
      typeof analytics !== "boolean" ||
      typeof advertising !== "boolean"
    ) {
      return null;
    }

    return { version, updatedAt, analytics, advertising };
  } catch {
    return null;
  }
}

/** Transforme un choix en valeur de cookie. */
export function serializeConsent(state: ConsentState): string {
  return encodeURIComponent(JSON.stringify(state));
}
