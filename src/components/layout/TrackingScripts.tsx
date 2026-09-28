"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/lib/consent/client";
import { captureAttribution, syncAttributionConsent } from "@/lib/tracking/attribution";
import { applyGoogleConsent } from "@/lib/tracking/google";
import { applyMetaConsent, trackMetaPageView } from "@/lib/tracking/meta";

/**
 * Pilote la balise Google, le Meta Pixel et la conservation des paramètres de campagne
 * selon le choix du visiteur. Invisible : il ne rend rien, et ne charge rien sans accord.
 */
export function TrackingScripts() {
  const consent = useConsent();
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  // Choix connu au chargement, puis à chaque modification dans la bannière.
  useEffect(() => {
    // undefined : choix pas encore lu (rendu serveur) ; on attend le navigateur.
    if (consent === undefined) {
      return;
    }
    applyGoogleConsent(consent);
    applyMetaConsent(consent);
    syncAttributionConsent(consent?.advertising === true);
  }, [consent]);

  // À chaque page : lecture des paramètres de campagne de l'adresse, et page vue pour le Pixel.
  useEffect(() => {
    captureAttribution();

    if (previousPathname.current !== null && previousPathname.current !== pathname) {
      trackMetaPageView();
    }
    previousPathname.current = pathname;
  }, [pathname]);

  return null;
}
