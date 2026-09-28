import { getConsent } from "@/lib/consent/client";
import { LIMITS, type TrackingData } from "@/lib/validation/shared";

/** Clé du stockage de session : les paramètres restent le temps de la visite (onglet ouvert). */
const STORAGE_KEY = "ap_attribution";

/** Paramètres de campagne, conservés sans condition : ils décrivent la campagne, pas le visiteur. */
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** Identifiants de clic publicitaire, conservés uniquement avec l'accord « publicité ». */
const CLICK_ID_KEYS = ["gclid", "fbclid"] as const;

type AttributionKey = (typeof UTM_KEYS)[number] | (typeof CLICK_ID_KEYS)[number];
type Attribution = { [key in AttributionKey]?: string };

/** Identifiants de clic lus à l'arrivée, en attente du choix du visiteur (jamais stockés sans accord). */
let pendingClickIds: Attribution = {};

/** Lit des paramètres dans l'adresse, nettoyés et limités en longueur. */
function pick(params: URLSearchParams, keys: readonly AttributionKey[]): Attribution {
  const result: Attribution = {};
  for (const key of keys) {
    const value = params.get(key)?.trim();
    if (value) {
      result[key] = value.slice(0, LIMITS.shortText);
    }
  }
  return result;
}

function isEmpty(attribution: Attribution): boolean {
  return Object.keys(attribution).length === 0;
}

function hasAdvertisingConsent(): boolean {
  return getConsent()?.advertising === true;
}

function readStored(): Attribution {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }
    const result: Attribution = {};
    for (const key of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
      const value = (parsed as { [key: string]: unknown })[key];
      if (typeof value === "string" && value !== "") {
        result[key] = value.slice(0, LIMITS.shortText);
      }
    }
    return result;
  } catch {
    return {};
  }
}

function writeStored(attribution: Attribution): void {
  try {
    if (isEmpty(attribution)) {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    }
  } catch {
    // Stockage indisponible (navigation privée stricte) : la demande partira sans origine.
  }
}

function withoutClickIds(attribution: Attribution): Attribution {
  const result: Attribution = { ...attribution };
  for (const key of CLICK_ID_KEYS) {
    delete result[key];
  }
  return result;
}

/**
 * Lit les paramètres de campagne de l'adresse actuelle. Les UTM remplacent ceux déjà conservés ;
 * les identifiants de clic attendent l'accord publicitaire avant d'être conservés.
 */
export function captureAttribution(): void {
  const params = new URLSearchParams(window.location.search);
  const utm = pick(params, UTM_KEYS);
  const clickIds = pick(params, CLICK_ID_KEYS);

  if (!isEmpty(utm)) {
    // Nouvelle arrivée par une campagne : ses paramètres remplacent les précédents.
    writeStored(utm);
  }
  if (!isEmpty(clickIds)) {
    pendingClickIds = clickIds;
  }

  syncAttributionConsent(hasAdvertisingConsent());
}

/**
 * Applique le choix publicitaire : avec accord, les identifiants de clic en attente sont conservés ;
 * sans accord, ils sont effacés de la mémoire et du stockage.
 */
export function syncAttributionConsent(advertising: boolean): void {
  if (advertising) {
    if (!isEmpty(pendingClickIds)) {
      writeStored({ ...readStored(), ...pendingClickIds });
      pendingClickIds = {};
    }
    return;
  }

  pendingClickIds = {};
  writeStored(withoutClickIds(readStored()));
}

/** Paramètres de campagne à envoyer avec un formulaire, ou undefined s'il n'y en a aucun. */
export function getAttribution(): TrackingData {
  const stored = readStored();
  const attribution = hasAdvertisingConsent() ? stored : withoutClickIds(stored);
  return isEmpty(attribution) ? undefined : attribution;
}
