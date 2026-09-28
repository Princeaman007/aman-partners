/** Préfixes des cookies de mesure d'audience (Google Analytics). */
export const ANALYTICS_COOKIE_PREFIXES = ["_ga"] as const;

/** Préfixes des cookies publicitaires (Google Ads et Meta). */
export const ADVERTISING_COOKIE_PREFIXES = ["_gcl_", "_fbp", "_fbc"] as const;

/**
 * Domaines sur lesquels un cookie a pu être déposé : le domaine exact, et chaque domaine parent
 * (Google Analytics dépose par exemple ses cookies sur « .aman-partners.be » depuis « www. »).
 */
function candidateDomains(hostname: string): string[] {
  const parts = hostname.split(".");
  const domains: string[] = [];

  for (let index = 0; index < parts.length - 1; index += 1) {
    domains.push(parts.slice(index).join("."));
  }

  return domains;
}

/** Supprime, dans ce navigateur, les cookies dont le nom commence par l'un des préfixes. */
export function deleteCookies(prefixes: readonly string[]): void {
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0]?.trim() ?? "")
    .filter((name) => name !== "" && prefixes.some((prefix) => name.startsWith(prefix)));

  const domains = candidateDomains(window.location.hostname);
  const expired = "Max-Age=0; Path=/";

  for (const name of names) {
    // Sans domaine (cookie du domaine exact), puis pour chaque domaine parent possible.
    document.cookie = `${name}=; ${expired}`;
    for (const domain of domains) {
      document.cookie = `${name}=; ${expired}; Domain=${domain}`;
      document.cookie = `${name}=; ${expired}; Domain=.${domain}`;
    }
  }
}
