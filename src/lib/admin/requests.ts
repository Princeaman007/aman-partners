import "server-only";
import { and, asc, count, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  REQUEST_STATUSES,
  REQUEST_TYPES,
  requestNotes,
  requests,
  type RequestNote,
  type RequestRecord,
  type RequestStatus,
  type RequestType,
} from "@/lib/db/schema";
import { ADMIN_PAGE_SIZE, type RequestFilters } from "./request-filters";

/** Une ligne de la liste des demandes : uniquement les colonnes affichées. */
export type RequestListItem = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  name: string;
  email: string;
  company: string | null;
  createdAt: Date;
};

export type RequestList = {
  items: RequestListItem[];
  total: number;
  page: number;
  pageCount: number;
};

export type RequestCounters = {
  byStatus: Record<RequestStatus, number>;
  byType: Record<RequestType, number>;
  /** Total des demandes, hors archivées. */
  totalActive: number;
};

const LIST_COLUMNS = {
  id: requests.id,
  type: requests.type,
  status: requests.status,
  name: requests.name,
  email: requests.email,
  company: requests.company,
  createdAt: requests.createdAt,
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Indique si une valeur est un identifiant de demande valide (UUID). */
export function isRequestId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/** Crée un compteur à zéro pour chaque clé de la liste. */
function zeroCounts<Key extends string>(keys: readonly Key[]): Record<Key, number> {
  const counts = {} as Record<Key, number>;
  for (const key of keys) {
    counts[key] = 0;
  }
  return counts;
}

/** Neutralise les caractères spéciaux d'une recherche LIKE (%, _ et \). */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

/** Conditions SQL correspondant aux filtres. Sans filtre de statut, les archivées sont exclues. */
function buildWhere(filters: RequestFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.type) {
    conditions.push(eq(requests.type, filters.type));
  }

  conditions.push(
    filters.status ? eq(requests.status, filters.status) : ne(requests.status, "archived"),
  );

  if (filters.q) {
    const pattern = `%${escapeLike(filters.q)}%`;
    const search = or(
      ilike(requests.name, pattern),
      ilike(requests.email, pattern),
      ilike(requests.company, pattern),
    );
    if (search) {
      conditions.push(search);
    }
  }

  return and(...conditions);
}

/** Liste filtrée et paginée des demandes, de la plus récente à la plus ancienne. */
export async function listRequests(filters: RequestFilters): Promise<RequestList> {
  const db = getDb();
  const where = buildWhere(filters);

  const [countRow] = await db.select({ total: count() }).from(requests).where(where);
  const total = countRow?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  const items = await db
    .select(LIST_COLUMNS)
    .from(requests)
    .where(where)
    .orderBy(desc(requests.createdAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset((page - 1) * ADMIN_PAGE_SIZE);

  return { items, total, page, pageCount };
}

/** Dernières demandes reçues, hors archivées. */
export async function listLatestRequests(limit = 5): Promise<RequestListItem[]> {
  return getDb()
    .select(LIST_COLUMNS)
    .from(requests)
    .where(ne(requests.status, "archived"))
    .orderBy(desc(requests.createdAt))
    .limit(limit);
}

/** Compteurs de la vue d'ensemble, calculés en une seule requête groupée. */
export async function getRequestCounters(): Promise<RequestCounters> {
  const rows = await getDb()
    .select({ type: requests.type, status: requests.status, total: count() })
    .from(requests)
    .groupBy(requests.type, requests.status);

  const byStatus = zeroCounts(REQUEST_STATUSES);
  const byType = zeroCounts(REQUEST_TYPES);
  let totalActive = 0;

  for (const row of rows) {
    byStatus[row.status] += row.total;
    if (row.status !== "archived") {
      byType[row.type] += row.total;
      totalActive += row.total;
    }
  }

  return { byStatus, byType, totalActive };
}

/** Une demande complète, ou null si l'identifiant est invalide ou inconnu. */
export async function getRequestById(id: string): Promise<RequestRecord | null> {
  if (!isRequestId(id)) {
    return null;
  }

  const [record] = await getDb().select().from(requests).where(eq(requests.id, id)).limit(1);
  return record ?? null;
}

/** Notes internes d'une demande, de la plus ancienne à la plus récente. */
export async function listRequestNotes(requestId: string): Promise<RequestNote[]> {
  return getDb()
    .select()
    .from(requestNotes)
    .where(eq(requestNotes.requestId, requestId))
    .orderBy(asc(requestNotes.createdAt));
}
