"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

/** Même clé que dans ThemeScript. */
const STORAGE_KEY = "theme";

function getCurrentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") {
    return chosen;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const t = useTranslations("ThemeToggle");

  function handleClick() {
    const next: Theme = getCurrentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Stockage indisponible : le thème s'applique pour cette visite uniquement.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t("label")}
      title={t("label")}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-md text-foreground",
        "transition-colors duration-150 hover:bg-foreground/5",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        className,
      )}
    >
      <Moon aria-hidden="true" strokeWidth={1.75} className="size-5 dark:hidden" />
      <Sun aria-hidden="true" strokeWidth={1.75} className="hidden size-5 dark:block" />
    </button>
  );
}
