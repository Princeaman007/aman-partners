"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const t = useTranslations("LanguageSwitcher");
  const currentLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className={cn("text-sm font-medium", className)}>
      <ul className="flex items-center gap-1">
        {routing.locales.map((locale) => {
          const code = locale.toUpperCase();

          return (
            <li key={locale}>
              {locale === currentLocale ? (
                <span aria-current="true" className="block px-2 py-1 text-foreground">
                  <span aria-hidden="true">{code}</span>
                  <span className="sr-only">{t(locale)}</span>
                </span>
              ) : (
                <Link
                  href={pathname}
                  locale={locale}
                  lang={locale}
                  hrefLang={locale}
                  className={cn(
                    "block rounded-sm px-2 py-1 text-muted transition-colors duration-150 hover:text-foreground",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                  )}
                >
                  <span aria-hidden="true">{code}</span>
                  <span className="sr-only">{t(locale)}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
