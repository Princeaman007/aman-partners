import "server-only";

/**
 * Adresse IP du visiteur, transmise par l'hébergeur dans les en-têtes de la requête.
 * Renvoie null si elle est introuvable (par exemple dans certains environnements de développement).
 */
export function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    // L'en-tête peut contenir une chaîne d'adresses : la première est celle du visiteur.
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return headers.get("x-real-ip")?.trim() ?? null;
}
