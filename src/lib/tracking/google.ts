import type { ConsentChoices } from "@/lib/consent/shared";
import { GA_COOKIE_EXPIRES, HAS_GOOGLE, TRACKING_IDS } from "./config";
import { ANALYTICS_COOKIE_PREFIXES, deleteCookies } from "./cookies";
import { loadScript } from "./load-script";

/** Préfixes des cookies de Google Ads (les cookies de Meta sont gérés par meta.ts). */
const GOOGLE_ADS_COOKIE_PREFIXES = ["_gcl_"] as const;

let initialized = false;
let scriptRequested = false;
let analyticsConfigured = false;
let adsConfigured = false;

/** Envoie une commande à la balise Google (sans effet si elle n'est pas initialisée). */
export function gtag(...args: unknown[]): void {
  window.gtag?.(...args);
}

/** GA4 a été configuré dans cette page (accord « mesure d'audience » donné au moins une fois). */
export function isGoogleAnalyticsConfigured(): boolean {
  return analyticsConfigured;
}

/** Google Ads a été configuré dans cette page (accord « publicité » donné au moins une fois). */
export function isGoogleAdsConfigured(): boolean {
  return adsConfigured;
}

/**
 * Prépare la balise Google : file d'attente, et Consent Mode v2 avec les quatre signaux
 * refusés par défaut. Aucune requête n'est envoyée à ce stade.
 */
function initialize(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtagQueue() {
    // La balise Google exige l'objet « arguments » d'origine, et non un tableau.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  // Sans accord publicitaire, les données de clic publicitaire sont masquées.
  gtag("set", "ads_data_redaction", true);
  gtag("js", new Date());
}

/**
 * Applique le choix du visiteur à la balise Google. Rien n'est chargé tant qu'aucune catégorie
 * utile n'est acceptée ; un accord retiré repasse les signaux à « refusé » et supprime les cookies.
 */
export function applyGoogleConsent(choices: ConsentChoices | null): void {
  if (!HAS_GOOGLE) {
    return;
  }

  const analytics = choices?.analytics === true && TRACKING_IDS.ga !== null;
  const advertising = choices?.advertising === true && TRACKING_IDS.googleAds !== null;

  // Aucun accord utile et rien de chargé : on ne fait rien du tout.
  if (!initialized && !analytics && !advertising) {
    return;
  }

  initialize();

  gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: advertising ? "granted" : "denied",
    ad_user_data: advertising ? "granted" : "denied",
    ad_personalization: advertising ? "granted" : "denied",
  });

  if (!analytics) {
    deleteCookies(ANALYTICS_COOKIE_PREFIXES);
  }
  if (!advertising) {
    deleteCookies(GOOGLE_ADS_COOKIE_PREFIXES);
  }

  if (analytics && !analyticsConfigured && TRACKING_IDS.ga) {
    analyticsConfigured = true;
    gtag("config", TRACKING_IDS.ga, { cookie_expires: GA_COOKIE_EXPIRES });
  }
  if (advertising && !adsConfigured && TRACKING_IDS.googleAds) {
    adsConfigured = true;
    gtag("config", TRACKING_IDS.googleAds);
  }

  const scriptId = TRACKING_IDS.ga ?? TRACKING_IDS.googleAds;
  if ((analytics || advertising) && !scriptRequested && scriptId) {
    scriptRequested = true;
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${scriptId}`).catch(() => {
      scriptRequested = false;
    });
  }
}
