import { getTranslations } from "next-intl/server";

export const MAIN_CONTENT_ID = "contenu";

const SKIP_LINK_CLASSES =
  "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground";

export async function SkipLink() {
  const t = await getTranslations("Navigation");

  return (
    <a href={`#${MAIN_CONTENT_ID}`} className={SKIP_LINK_CLASSES}>
      {t("skipToContent")}
    </a>
  );
}
