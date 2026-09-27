import "server-only";
import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { rateLimits } from "@/lib/db/schema";

/** Nombre d'envois autorisés par visiteur, et durée de la période, pour chaque formulaire. */
export const RATE_LIMITS = {
  contact: { limit: 5, windowSeconds: 60 * 60 },
  project: { limit: 5, windowSeconds: 60 * 60 },
  partner: { limit: 3, windowSeconds: 60 * 60 },
  /** Tentatives de connexion au dashboard : 5 par quart d'heure. */
  adminLogin: { limit: 5, windowSeconds: 15 * 60 },
} as const;

export type RateLimitScope = keyof typeof RATE_LIMITS;

export type RateLimitResult = {
  allowed: boolean;
  /** Secondes avant de pouvoir réessayer (0 si l'envoi est autorisé). */
  retryAfterSeconds: number;
};

/** Probabilité de nettoyer les anciens compteurs à chaque appel (ici, une fois sur vingt). */
const PURGE_PROBABILITY = 0.05;

/** Empreinte irréversible de l'adresse IP : l'adresse elle-même n'est jamais enregistrée. */
function hashIp(ip: string): string {
  const secret = process.env.RATE_LIMIT_SECRET;

  if (!secret) {
    throw new Error("RATE_LIMIT_SECRET est manquante : ajoutez-la dans le fichier .env.local.");
  }

  return createHmac("sha256", secret).update(ip).digest("hex");
}

/** Supprime les compteurs de plus d'un jour : ils ne servent plus et n'ont pas à être conservés. */
async function purgeExpiredCounters(): Promise<void> {
  await getDb()
    .delete(rateLimits)
    .where(sql`${rateLimits.windowStart} < now() - interval '1 day'`);
}

/**
 * Enregistre une tentative d'envoi et indique si elle est autorisée.
 * Le compteur et sa période sont mis à jour en une seule requête SQL, sans risque de conflit
 * entre deux envois simultanés.
 */
export async function checkRateLimit(
  scope: RateLimitScope,
  ip: string | null,
): Promise<RateLimitResult> {
  const { limit, windowSeconds } = RATE_LIMITS[scope];
  const key = `${scope}:${hashIp(ip ?? "unknown")}`;

  const windowExpired = sql`${rateLimits.windowStart} < now() - make_interval(secs => ${windowSeconds})`;

  const [counter] = await getDb()
    .insert(rateLimits)
    .values({ key, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${windowExpired} THEN 1 ELSE ${rateLimits.count} + 1 END`,
        windowStart: sql`CASE WHEN ${windowExpired} THEN now() ELSE ${rateLimits.windowStart} END`,
      },
    })
    .returning({ count: rateLimits.count, windowStart: rateLimits.windowStart });

  if (Math.random() < PURGE_PROBABILITY) {
    await purgeExpiredCounters();
  }

  if (!counter) {
    throw new Error("La limitation des envois n'a pas pu être vérifiée.");
  }

  if (counter.count <= limit) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const windowEndsAt = counter.windowStart.getTime() + windowSeconds * 1000;
  const retryAfterSeconds = Math.max(1, Math.ceil((windowEndsAt - Date.now()) / 1000));

  return { allowed: false, retryAfterSeconds };
}
