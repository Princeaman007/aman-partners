import "server-only";

/** Adresse publique du site, sans barre oblique finale (localhost en développement). */
function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

/** Lien direct vers la fiche d'une demande dans le dashboard. */
export function adminRequestUrl(requestId: string): string {
  return `${getSiteUrl()}/admin/demandes/${requestId}`;
}
