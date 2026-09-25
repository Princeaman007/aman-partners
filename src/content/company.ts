/**
 * Coordonnées officielles d'Aman & Partners.
 * Les valeurs entre crochets sont des repères à remplacer avant la mise en ligne.
 */
export const COMPANY = {
  email: "[EMAIL]",
  phone: "[TÉLÉPHONE]",
  companyNumber: "[NUMÉRO BCE]",
} as const;

/** Indique si une valeur est encore un repère à compléter, comme « [EMAIL] ». */
export function isPlaceholder(value: string): boolean {
  return value.startsWith("[") && value.endsWith("]");
}

/** Transforme un numéro affiché (« +32 470 12 34 56 ») en lien d'appel (« tel:+32470123456 »). */
export function toPhoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
