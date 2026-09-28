import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent/shared";
import { getClientIp } from "@/lib/services/client-ip";
import type { TrackingData } from "@/lib/validation/shared";

/**
 * Version de l'API Graph de Meta. À vérifier au moment de la mise en ligne dans la
 * documentation de Meta (developers.facebook.com), qui publie une nouvelle version régulièrement.
 */
const GRAPH_API_VERSION = "v23.0";

/** Délai maximal d'attente de la réponse de Meta. */
const TIMEOUT_MS = 5000;

const EVENT_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

export type MetaServerEvent = {
  /** Événement standard de Meta : demande de projet (Lead) ou message de contact (Contact). */
  eventName: "Lead" | "Contact";
  /** Identifiant partagé avec le Pixel, pour que Meta ne compte l'événement qu'une fois. */
  eventId: string;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  tracking?: TrackingData;
};

/** Identifiant d'événement envoyé par le navigateur, ou un nouveau s'il est absent ou invalide. */
export function resolveEventId(value: unknown): string {
  return typeof value === "string" && EVENT_ID_PATTERN.test(value) ? value : randomUUID();
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Empreinte d'un texte normalisé (minuscules, sans espaces autour), ou undefined s'il est vide. */
function hashText(value: string | null | undefined): string[] | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized ? [sha256(normalized)] : undefined;
}

/** Empreinte d'un téléphone réduit à ses chiffres, comme Meta l'attend. */
function hashPhone(value: string | null | undefined): string[] | undefined {
  const digits = value?.replace(/\D/g, "");
  return digits ? [sha256(digits)] : undefined;
}

/** Lit un cookie dans l'en-tête « Cookie » de la requête. */
function readCookie(header: string | null, name: string): string | null {
  if (!header) {
    return null;
  }
  const prefix = `${name}=`;
  const entry = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return entry ? entry.slice(prefix.length) : null;
}

/** Le visiteur a donné son accord « publicité » (cookie ap_consent de la requête). */
function hasAdvertisingConsent(cookieHeader: string | null): boolean {
  return parseConsent(readCookie(cookieHeader, CONSENT_COOKIE))?.advertising === true;
}

/** Identifiant du Pixel, au même format que côté navigateur. */
function readPixelId(): string | null {
  const value = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return value && /^\d{10,20}$/.test(value) ? value : null;
}

/** Adresse de la page d'envoi, uniquement si elle appartient au site. */
function readSourceUrl(request: Request): string | undefined {
  const referer = request.headers.get("referer");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return referer && siteUrl && referer.startsWith(siteUrl) ? referer : undefined;
}

/**
 * Signale une conversion à la Meta Conversions API, depuis le serveur.
 * Sans configuration (Pixel et jeton) ou sans accord publicitaire du visiteur : rien n'est envoyé.
 */
export async function sendMetaConversion(request: Request, event: MetaServerEvent): Promise<void> {
  const pixelId = readPixelId();
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    return;
  }

  const cookieHeader = request.headers.get("cookie");
  if (!hasAdvertisingConsent(cookieHeader)) {
    return;
  }

  // Identifiants de navigateur et de clic Meta : cookies du Pixel, sinon fbclid de la visite.
  const fbp = readCookie(cookieHeader, "_fbp") ?? undefined;
  const fbclid = event.tracking?.fbclid;
  const fbc =
    readCookie(cookieHeader, "_fbc") ?? (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined);

  const body = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: "website",
        event_source_url: readSourceUrl(request),
        user_data: {
          em: hashText(event.email),
          ph: hashPhone(event.phone),
          fn: hashText(event.firstName),
          ln: hashText(event.lastName),
          client_ip_address: getClientIp(request.headers) ?? undefined,
          client_user_agent: request.headers.get("user-agent") ?? undefined,
          fbp,
          fbc,
        },
      },
    ],
    // Code de test du gestionnaire d'événements Meta, pour vérifier la réception sans fausser les statistiques.
    test_event_code: process.env.META_CAPI_TEST_EVENT_CODE || undefined,
  };

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Jeton transmis dans l'en-tête, jamais dans l'adresse : il n'apparaît dans aucun journal.
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error(`Meta Conversions API : réponse ${response.status} (${await response.text()})`);
  }
}
