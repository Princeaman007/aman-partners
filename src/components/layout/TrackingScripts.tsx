"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/lib/consent/client";
import { applyGoogleConsent } from "@/lib/tracking/google";
import { applyMetaConsent, trackMetaPageView } from "@/lib/tracking/meta";

/**
 * Pilote la balise Google et le Meta Pixel selon le choix du visiteur dans la bannière de cookies.
 * Invisible : il ne rend rien, et ne charge rien tant qu'aucun accord n'est donné.
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
  }, [consent]);

  // Changement de page sans rechargement : GA4 le détecte seul, le Meta Pixel doit être prévenu.
  useEffect(() => {
    if (previousPathname.current !== null && previousPathname.current !== pathname) {
      trackMetaPageView();
    }
    previousPathname.current = pathname;
  }, [pathname]);

  return null;
}
