import { useSyncExternalStore } from "react";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  CONSENT_VERSION,
  parseConsent,
  serializeConsent,
  type ConsentChoices,
  type ConsentState,
} from "./shared";

/** Événement émis sur window après chaque enregistrement du choix (utilisé en phase 6). */
export const CONSENT_CHANGE_EVENT = "ap:consent-change";

/** Événement qui demande à la bannière de rouvrir les préférences. */
export const CONSENT_OPEN_EVENT = "ap:consent-open";

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedState: ConsentState | null = null;

function readRawCookie(): string | null {
  const prefix = `${CONSENT_COOKIE}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return entry ? entry.slice(prefix.length) : null;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Choix actuel du visiteur, ou null s'il n'a pas encore choisi. */
export function getConsent(): ConsentState | null {
  const raw = readRawCookie();

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parseConsent(raw);
  }

  return cachedState;
}

function getServerConsent(): undefined {
  return undefined;
}

/** Enregistre le choix du visiteur et prévient le reste du site. */
export function saveConsent(choices: ConsentChoices): ConsentState {
  const state: ConsentState = {
    ...choices,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(state)}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;

  listeners.forEach((listener) => listener());
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: state }));

  return state;
}

/** Demande à la bannière de rouvrir les préférences (lien « Gérer les cookies »). */
export function openConsentPreferences() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

/**
 * Choix du visiteur, suivi en temps réel.
 * undefined : pas encore connu (rendu serveur) ; null : aucun choix ; sinon, le choix enregistré.
 */
export function useConsent(): ConsentState | null | undefined {
  return useSyncExternalStore<ConsentState | null | undefined>(
    subscribe,
    getConsent,
    getServerConsent,
  );
}
