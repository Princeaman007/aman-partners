import type { ConsentChoices } from "@/lib/consent/shared";
import { HAS_META, TRACKING_IDS } from "./config";
import { deleteCookies } from "./cookies";
import { loadScript } from "./load-script";

type MetaPixel = NonNullable<Window["fbq"]>;

/** Préfixes des cookies du Meta Pixel. */
const META_COOKIE_PREFIXES = ["_fbp", "_fbc"] as const;

const META_SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";

let initialized = false;
let granted = false;

/** Envoie une commande au Meta Pixel (sans effet s'il n'est pas initialisé). */
export function fbq(...args: unknown[]): void {
  window.fbq?.(...args);
}

/**
 * Crée la file d'attente du Pixel, telle que le script de Meta l'attend :
 * les commandes y patientent jusqu'à l'arrivée du script, qui les exécute ensuite.
 */
function createQueue(): void {
  if (window.fbq) {
    return;
  }

  const queue = ((...args: unknown[]) => {
    if (queue.callMethod) {
      queue.callMethod(...args);
    } else {
      queue.queue.push(args);
    }
  }) as MetaPixel;

  queue.queue = [];
  queue.loaded = true;
  queue.version = "2.0";
  queue.push = queue;

  window.fbq = queue;
  window._fbq = queue;
}

/**
 * Applique le choix du visiteur au Meta Pixel, qui ne dépend que de l'accord « publicité ».
 * Rien n'est chargé sans cet accord ; un accord retiré révoque le Pixel et supprime ses cookies.
 */
export function applyMetaConsent(choices: ConsentChoices | null): void {
  const pixelId = TRACKING_IDS.metaPixel;
  if (!HAS_META || !pixelId) {
    return;
  }

  const advertising = choices?.advertising === true;

  // Pas d'accord publicitaire et rien de chargé : on ne fait rien du tout.
  if (!initialized && !advertising) {
    return;
  }

  if (advertising) {
    if (!initialized) {
      initialized = true;
      createQueue();
      fbq("consent", "grant");
      fbq("init", pixelId);
      fbq("track", "PageView");
      loadScript(META_SCRIPT_URL).catch(() => {
        // Script bloqué (bloqueur de publicité, réseau) : le site continue normalement.
      });
    } else if (!granted) {
      fbq("consent", "grant");
    }
    granted = true;
    return;
  }

  // Accord retiré après le chargement.
  fbq("consent", "revoke");
  deleteCookies(META_COOKIE_PREFIXES);
  granted = false;
}

/** Signale une nouvelle page vue au Pixel (changement de page sans rechargement complet). */
export function trackMetaPageView(): void {
  if (initialized && granted) {
    fbq("track", "PageView");
  }
}
