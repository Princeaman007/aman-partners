import { getConsent } from "@/lib/consent/client";
import { TRACKING_IDS } from "./config";
import { gtag, isGoogleAdsConfigured, isGoogleAnalyticsConfigured } from "./google";
import { fbq, isMetaPixelActive } from "./meta";

/** Conversions suivies par le site (les candidatures partenaires n'en font pas partie). */
export type ConversionName = "projectRequest" | "contactMessage" | "bookCallClick";

type ConversionDefinition = {
  /** Nom de l'événement dans Google Analytics 4. */
  ga4Event: string;
  /** Nom de l'événement pour le Meta Pixel. */
  metaEvent: string;
  /** Événement standard de Meta (track) ou personnalisé (trackCustom). */
  metaStandard: boolean;
  /** Conversion principale, envoyée aussi à Google Ads avec le libellé configuré. */
  googleAdsLead: boolean;
};

const CONVERSIONS: { [name in ConversionName]: ConversionDefinition } = {
  projectRequest: {
    ga4Event: "generate_lead",
    metaEvent: "Lead",
    metaStandard: true,
    googleAdsLead: true,
  },
  contactMessage: {
    ga4Event: "contact_form_submit",
    metaEvent: "Contact",
    metaStandard: true,
    googleAdsLead: false,
  },
  bookCallClick: {
    ga4Event: "book_call_click",
    metaEvent: "BookCallClick",
    metaStandard: false,
    googleAdsLead: false,
  },
};

/**
 * Identifiant unique d'une conversion. Partagé entre le Pixel et le serveur (Conversions API),
 * il permet à Meta de ne compter qu'une fois la même demande.
 */
export function createEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Signale une conversion aux outils actifs, selon le choix du visiteur au moment même :
 * GA4 avec l'accord « mesure d'audience », Google Ads et Meta avec l'accord « publicité ».
 */
export function trackConversion(name: ConversionName, eventId: string): void {
  const consent = getConsent();
  const definition = CONVERSIONS[name];

  if (consent?.analytics === true && isGoogleAnalyticsConfigured() && TRACKING_IDS.ga) {
    gtag("event", definition.ga4Event, { send_to: TRACKING_IDS.ga, event_id: eventId });
  }

  const adsId = TRACKING_IDS.googleAds;
  const leadLabel = TRACKING_IDS.googleAdsLeadLabel;
  if (
    definition.googleAdsLead &&
    consent?.advertising === true &&
    isGoogleAdsConfigured() &&
    adsId &&
    leadLabel
  ) {
    gtag("event", "conversion", { send_to: `${adsId}/${leadLabel}`, transaction_id: eventId });
  }

  if (consent?.advertising === true && isMetaPixelActive()) {
    fbq(
      definition.metaStandard ? "track" : "trackCustom",
      definition.metaEvent,
      {},
      {
        eventID: eventId,
      },
    );
  }
}
