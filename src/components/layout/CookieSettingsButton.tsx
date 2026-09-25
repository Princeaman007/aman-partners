"use client";

import type { ReactNode } from "react";
import { openConsentPreferences } from "@/lib/consent/client";

type CookieSettingsButtonProps = {
  children: ReactNode;
  className?: string;
};

/** Bouton qui rouvre les préférences de cookies, utilisable depuis un composant serveur. */
export function CookieSettingsButton({ children, className }: CookieSettingsButtonProps) {
  return (
    <button type="button" onClick={openConsentPreferences} className={className}>
      {children}
    </button>
  );
}
