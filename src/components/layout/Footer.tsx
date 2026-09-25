import type { ComponentProps, ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { COMPANY, isPlaceholder, toPhoneHref } from "@/content/company";
import { Link } from "@/i18n/navigation";
import { CONTACT_HREF, LEGAL_NAV, MAIN_NAV, PARTNERS_HREF } from "./navigation";

const LINK_CLASSES =
  "rounded-sm text-sm text-muted transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

const ICON_CLASSES = "mt-0.5 size-4 shrink-0";

type FooterColumnProps = {
  title: string;
  children: ReactNode;
};

function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

type FooterLinkProps = {
  href: ComponentProps<typeof Link>["href"];
  children: ReactNode;
};

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <Link href={href} className={LINK_CLASSES}>
      {children}
    </Link>
  );
}

export async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Navigation");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link
              href="/"
              aria-label={tNav("home")}
              className="inline-block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted">{t("tagline")}</p>
          </div>

          <nav
            aria-label={t("navLabel")}
            className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4"
          >
            <FooterColumn title={t("company")}>
              <ul className="space-y-3">
                {MAIN_NAV.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{tNav(item.labelKey)}</FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            <FooterColumn title={t("partners")}>
              <p className="text-sm text-muted">{t("partnersText")}</p>
              <p className="mt-3">
                <Link
                  href={PARTNERS_HREF}
                  className="rounded-sm text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {t("joinNetwork")}
                </Link>
              </p>
            </FooterColumn>

            <FooterColumn title={t("contact")}>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex gap-3">
                  <Mail aria-hidden="true" strokeWidth={1.5} className={ICON_CLASSES} />
                  <span className="sr-only">{t("email")}</span>
                  {isPlaceholder(COMPANY.email) ? (
                    <span>{COMPANY.email}</span>
                  ) : (
                    <a href={`mailto:${COMPANY.email}`} className={LINK_CLASSES}>
                      {COMPANY.email}
                    </a>
                  )}
                </li>
                <li className="flex gap-3">
                  <Phone aria-hidden="true" strokeWidth={1.5} className={ICON_CLASSES} />
                  <span className="sr-only">{t("phone")}</span>
                  {isPlaceholder(COMPANY.phone) ? (
                    <span>{COMPANY.phone}</span>
                  ) : (
                    <a href={toPhoneHref(COMPANY.phone)} className={LINK_CLASSES}>
                      {COMPANY.phone}
                    </a>
                  )}
                </li>
                <li className="flex gap-3">
                  <MapPin aria-hidden="true" strokeWidth={1.5} className={ICON_CLASSES} />
                  <span>{t("location")}</span>
                </li>
                <li className="pt-1">
                  <FooterLink href={CONTACT_HREF}>{t("contactPage")}</FooterLink>
                </li>
              </ul>
            </FooterColumn>

            <FooterColumn title={t("legal")}>
              <ul className="space-y-3">
                {LEGAL_NAV.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href}>{t(item.labelKey)}</FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-border pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year })}</p>
          <p>{t("companyNumber", { number: COMPANY.companyNumber })}</p>
        </div>
      </Container>
    </footer>
  );
}
