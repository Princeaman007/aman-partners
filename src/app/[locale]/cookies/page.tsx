import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { CookieSettingsButton } from "@/components/layout/CookieSettingsButton";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getLegalSections } from "@/lib/legal/document";
import { createPageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = createPageMetadata("cookies", "/cookies");

type CookiesPageProps = {
  params: Promise<{ locale: string }>;
};

/** Politique de cookies, avec un bouton pour modifier son choix à tout moment. */
export default async function CookiesPage({ params }: CookiesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Legal.cookies");
  const tFooter = await getTranslations("Footer");
  const messages = await getMessages();

  return (
    <LegalDocument
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      sections={getLegalSections(messages, "cookies")}
    >
      <section
        aria-labelledby="cookies-manage-title"
        className="rounded-lg border border-foreground bg-surface p-6"
      >
        <h2 id="cookies-manage-title" className="text-lg font-semibold tracking-tight">
          {t("manageTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("manageText")}</p>
        <div className="mt-4">
          <CookieSettingsButton>{tFooter("manageCookies")}</CookieSettingsButton>
        </div>
      </section>
    </LegalDocument>
  );
}
