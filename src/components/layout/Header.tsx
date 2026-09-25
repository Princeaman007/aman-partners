import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { HeaderShell } from "./HeaderShell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavLinks } from "./NavLinks";
import { PRIMARY_CTA_HREF } from "./navigation";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const t = await getTranslations("Navigation");

  return (
    <HeaderShell>
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label={t("home")}
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <Logo />
        </Link>

        <nav aria-label={t("main")} className="hidden lg:block">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <ButtonLink href={PRIMARY_CTA_HREF} size="sm" className="ml-3 hidden lg:inline-flex">
            {t("cta")}
          </ButtonLink>
        </div>
      </Container>
    </HeaderShell>
  );
}
