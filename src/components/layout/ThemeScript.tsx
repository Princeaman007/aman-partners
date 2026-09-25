"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";

/**
 * Applique le thème choisi par le visiteur avant l'affichage de la page,
 * pour éviter un flash du mauvais thème. Sans choix enregistré, le site
 * suit la préférence du système (prefers-color-scheme).
 *
 * Le script est injecté dans le HTML envoyé par le serveur, en dehors de
 * l'arbre React : React ne le revoit donc pas côté navigateur.
 */
const script = `(function () {
  try {
    var theme = localStorage.getItem("theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
    }
  } catch (error) {}
})();`;

export function ThemeScript() {
  const isInserted = useRef(false);

  useServerInsertedHTML(() => {
    if (isInserted.current) {
      return null;
    }
    isInserted.current = true;
    return <script dangerouslySetInnerHTML={{ __html: script }} />;
  });

  return null;
}
