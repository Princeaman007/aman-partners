import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ExternalLink as ExternalLinkIcon, LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { requireAdmin } from "@/lib/admin/auth";
import { logoutAction } from "../actions";

const CONTENT_ID = "admin-content";

/** Styles des liens et boutons du pied de la barre latérale. */
const SIDEBAR_ACTION_CLASSES =
  "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-muted transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

type DashboardLayoutProps = {
  children: ReactNode;
};

/** Gabarit des pages protégées : barre latérale sur ordinateur, barre supérieure et onglets sur téléphone. */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  await requireAdmin();

  const t = await getTranslations({ locale: "fr", namespace: "Admin.layout" });

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Lien d'évitement : premier élément atteint au clavier */}
      <Link
        href={`#${CONTENT_ID}`}
        className="sr-only rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
      >
        {t("skipToContent")}
      </Link>

      {/* Barre latérale, sur ordinateur */}
      <aside className="hidden border-r border-border bg-background lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="px-6 py-6">
          <Link
            href="/admin"
            aria-label={t("home")}
            className="inline-block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            <Logo />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <Suspense fallback={null}>
            <AdminNav orientation="vertical" />
          </Suspense>
        </div>

        <div className="space-y-1 border-t border-border p-3">
          <Link href="/" target="_blank" rel="noopener" className={SIDEBAR_ACTION_CLASSES}>
            <ExternalLinkIcon aria-hidden="true" strokeWidth={1.5} className="size-4 shrink-0" />
            {t("viewSite")}
            <span className="sr-only">{t("newTab")}</span>
          </Link>
          <div className="px-1 py-1">
            <ThemeToggle />
          </div>
          <form action={logoutAction}>
            <button type="submit" className={SIDEBAR_ACTION_CLASSES}>
              <LogOut aria-hidden="true" strokeWidth={1.5} className="size-4 shrink-0" />
              {t("logout")}
            </button>
          </form>
        </div>
      </aside>

      {/* Barre supérieure et onglets, sur téléphone et tablette */}
      <header className="sticky top-0 z-30 border-b border-border bg-background lg:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            aria-label={t("home")}
            className="inline-block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex size-10 cursor-pointer items-center justify-center rounded-md text-muted transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <LogOut aria-hidden="true" strokeWidth={1.5} className="size-5" />
                <span className="sr-only">{t("logout")}</span>
              </button>
            </form>
          </div>
        </div>
        <Suspense fallback={null}>
          <AdminNav orientation="horizontal" />
        </Suspense>
      </header>

      {/* Contenu de la page */}
      <main
        id={CONTENT_ID}
        tabIndex={-1}
        className="min-w-0 bg-surface px-4 py-8 outline-none sm:px-6 lg:min-h-dvh lg:px-10 lg:py-12"
      >
        {children}
      </main>
    </div>
  );
}
