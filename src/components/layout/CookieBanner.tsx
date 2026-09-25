"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Link } from "@/i18n/navigation";
import { CONSENT_OPEN_EVENT, getConsent, saveConsent, useConsent } from "@/lib/consent/client";
import {
  ACCEPT_ALL,
  CONSENT_CATEGORIES,
  REJECT_ALL,
  type ConsentCategory,
  type ConsentChoices,
} from "@/lib/consent/shared";

type View = "summary" | "preferences";

/** Textes de chaque catégorie, dans le bloc « CookieBanner » des traductions. */
const CATEGORY_TEXTS = {
  analytics: { title: "analyticsTitle", text: "analyticsText" },
  advertising: { title: "advertisingTitle", text: "advertisingText" },
} as const satisfies Record<ConsentCategory, { title: string; text: string }>;

const LINK_CLASSES =
  "rounded-sm text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/** Choix de départ de la vue détaillée : le choix déjà enregistré, sinon tout refusé. */
function getInitialChoices(): ConsentChoices {
  const saved = getConsent();
  return saved ? { analytics: saved.analytics, advertising: saved.advertising } : REJECT_ALL;
}

export function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const consent = useConsent();
  const baseId = useId();
  const titleId = `${baseId}-title`;

  const [view, setView] = useState<View>("summary");
  const [choices, setChoices] = useState<ConsentChoices>(REJECT_ALL);
  const [isReopened, setIsReopened] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);

  const headingRef = useRef<HTMLHeadingElement>(null);

  // À chaque demande (changement de vue, réouverture), place le focus sur le titre.
  useEffect(() => {
    if (focusRequest > 0) {
      headingRef.current?.focus();
    }
  }, [focusRequest]);

  // Réouverture des préférences depuis le lien « Gérer les cookies ».
  useEffect(() => {
    function handleOpen() {
      setChoices(getInitialChoices());
      setView("preferences");
      setIsReopened(true);
      setFocusRequest((count) => count + 1);
    }

    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  function showView(next: View) {
    setView(next);
    setFocusRequest((count) => count + 1);
  }

  function openPreferences() {
    setChoices(getInitialChoices());
    showView("preferences");
  }

  function toggleCategory(category: ConsentCategory, checked: boolean) {
    setChoices((current) => ({ ...current, [category]: checked }));
  }

  function save(next: ConsentChoices) {
    saveConsent(next);
    setView("summary");
    setIsReopened(false);
  }

  // undefined : rendu serveur, choix encore inconnu.
  // Objet : le visiteur a déjà choisi, la bannière ne s'affiche que s'il l'a rouverte.
  if (consent === undefined || (consent !== null && !isReopened)) {
    return null;
  }

  return (
    <section
      aria-labelledby={titleId}
      className="fixed right-4 bottom-4 left-4 z-50 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border border-border bg-background p-6 sm:right-auto sm:bottom-6 sm:left-6 sm:w-full sm:max-w-md"
    >
      <h2
        id={titleId}
        ref={headingRef}
        tabIndex={-1}
        className="text-base font-bold tracking-tight outline-none"
      >
        {view === "summary" ? t("title") : t("preferencesTitle")}
      </h2>

      {view === "summary" ? (
        <>
          <p className="mt-2 text-sm text-muted">{t("text")}</p>
          <p className="mt-3">
            <Link href="/cookies" className={LINK_CLASSES}>
              {t("learnMore")}
            </Link>
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" size="sm" onClick={() => save(REJECT_ALL)}>
              {t("rejectAll")}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => save(ACCEPT_ALL)}>
              {t("acceptAll")}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={openPreferences} className="mt-2 w-full">
            {t("customize")}
          </Button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">{t("preferencesText")}</p>

          <ul className="mt-4 divide-y divide-border border-y border-border">
            <li className="py-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-semibold text-foreground">{t("necessaryTitle")}</p>
                <p className="shrink-0 text-xs text-muted">{t("alwaysActive")}</p>
              </div>
              <p className="mt-1 text-sm text-muted">{t("necessaryText")}</p>
            </li>

            {CONSENT_CATEGORIES.map((category) => {
              const inputId = `${baseId}-${category}`;
              const descriptionId = `${inputId}-description`;

              return (
                <li key={category} className="py-4">
                  <Checkbox
                    id={inputId}
                    label={
                      <span className="font-semibold">{t(CATEGORY_TEXTS[category].title)}</span>
                    }
                    checked={choices[category]}
                    onChange={(event) => toggleCategory(category, event.target.checked)}
                    aria-describedby={descriptionId}
                  />
                  <p id={descriptionId} className="mt-1 pl-8 text-sm text-muted">
                    {t(CATEGORY_TEXTS[category].text)}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="ghost" size="sm" onClick={() => showView("summary")}>
              {t("back")}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => save(choices)}>
              {t("save")}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
