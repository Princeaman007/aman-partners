"use client";

import { useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/Logo";
import { buttonStyles } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MAIN_NAV, PRIMARY_CTA_HREF } from "./navigation";
import { ThemeToggle } from "./ThemeToggle";

/** Largeur à partir de laquelle le header affiche la navigation complète (lg de Tailwind). */
const DESKTOP_QUERY = "(min-width: 64rem)";

const ICON_BUTTON_CLASSES =
  "inline-flex size-10 items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

type MobileMenuProps = {
  className?: string;
};

export function MobileMenu({ className }: MobileMenuProps) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openMenu() {
    dialogRef.current?.showModal();
  }

  function closeMenu() {
    dialogRef.current?.close();
  }

  // Ferme le menu si la fenêtre s'élargit jusqu'à la taille ordinateur.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        dialogRef.current?.close();
      }
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        aria-haspopup="dialog"
        aria-label={t("openMenu")}
        className={cn(ICON_BUTTON_CLASSES, className)}
      >
        <Menu aria-hidden="true" strokeWidth={1.75} className="size-5" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label={t("menu")}
        className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-background p-0 text-foreground backdrop:bg-transparent open:flex open:flex-col"
      >
        <Container size="full" className="flex h-16 shrink-0 items-center justify-between">
          <Link
            href="/"
            onClick={closeMenu}
            aria-label={t("home")}
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            <Logo />
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            aria-label={t("closeMenu")}
            className={ICON_BUTTON_CLASSES}
          >
            <X aria-hidden="true" strokeWidth={1.75} className="size-5" />
          </button>
        </Container>

        <Container className="flex flex-1 flex-col justify-between overflow-y-auto pt-8 pb-10">
          <nav aria-label={t("main")}>
            <ul className="space-y-1">
              {MAIN_NAV.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md py-3 text-3xl font-bold tracking-tight",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                        isActive ? "text-foreground" : "text-muted hover:text-foreground",
                      )}
                    >
                      {isActive ? (
                        <span aria-hidden="true" className="size-2 rounded-full bg-foreground" />
                      ) : null}
                      {t(item.labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-12 space-y-6">
            <Link
              href={PRIMARY_CTA_HREF}
              onClick={closeMenu}
              className={cn(buttonStyles({ size: "lg" }), "w-full")}
            >
              {t("cta")}
            </Link>
            <div className="flex items-center justify-between border-t border-border pt-6">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </Container>
      </dialog>
    </>
  );
}
