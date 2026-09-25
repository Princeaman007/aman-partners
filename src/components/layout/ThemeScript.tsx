/**
 * Applique le thème choisi par le visiteur avant l'affichage de la page,
 * pour éviter un flash du mauvais thème. Sans choix enregistré, le site
 * suit la préférence du système (prefers-color-scheme).
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
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
