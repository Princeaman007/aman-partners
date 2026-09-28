import {
  REQUEST_STATUSES,
  REQUEST_TYPES,
  type RequestStatus,
  type RequestType,
} from "@/lib/db/schema";

/** Adresse de la liste des demandes. */
export const ADMIN_REQUESTS_PATH = "/admin/demandes";

/** Nombre de demandes par page. */
export const ADMIN_PAGE_SIZE = 25;

/** Longueur maximale d'une recherche. */
const MAX_QUERY_LENGTH = 100;

/** Page maximale acceptée dans l'adresse, pour refuser les valeurs absurdes. */
const MAX_PAGE = 10_000;

/** Filtres de la liste des demandes, lus et vérifiés depuis l'adresse. */
export type RequestFilters = {
  type?: RequestType;
  status?: RequestStatus;
  q?: string;
  page: number;
};

/** Paramètres de l'adresse, tels que Next.js les fournit à une page. */
export type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function isRequestType(value: unknown): value is RequestType {
  return typeof value === "string" && (REQUEST_TYPES as readonly string[]).includes(value);
}

export function isRequestStatus(value: unknown): value is RequestStatus {
  return typeof value === "string" && (REQUEST_STATUSES as readonly string[]).includes(value);
}

/** Lit et vérifie les filtres de l'adresse : toute valeur inconnue ou invalide est ignorée. */
export function parseRequestFilters(searchParams: SearchParams): RequestFilters {
  const type = firstValue(searchParams.type);
  const status = firstValue(searchParams.status);
  const q = firstValue(searchParams.q)?.trim().slice(0, MAX_QUERY_LENGTH);
  const page = Number.parseInt(firstValue(searchParams.page) ?? "1", 10);

  return {
    type: isRequestType(type) ? type : undefined,
    status: isRequestStatus(status) ? status : undefined,
    q: q ? q : undefined,
    page: Number.isInteger(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1,
  };
}

/** Adresse de la liste avec des filtres donnés (la première page n'apparaît pas dans l'adresse). */
export function buildRequestsHref(filters: Partial<RequestFilters>): string {
  const params = new URLSearchParams();

  if (filters.type) {
    params.set("type", filters.type);
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  const query = params.toString();
  return query ? `${ADMIN_REQUESTS_PATH}?${query}` : ADMIN_REQUESTS_PATH;
}
