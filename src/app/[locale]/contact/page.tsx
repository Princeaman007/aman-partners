import ExternalLink from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/forms/ContactForm";
import { PRIMARY_CTA_HREF } from "@/components/layout/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { COMPANY, isPlaceholder, toPhoneHref } from "@/content/company";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

const LINK_CLASSES =
  "rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ContactPage");
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <div className="border-t border-border py-20 sm:py-28">
        <Container className="grid gap-16 lg:grid-cols-12 lg:gap-16">
          <aside className="space-y-12 lg:col-span-4">
            <section aria-labelledby="contact-details-title">
              <h2 id="contact-details-title" className="text-lg font-semibold tracking-tight">
                {t("detailsTitle")}
              </h2>
              <dl className="mt-6 space-y-5 text-sm">
                <div className="flex gap-4">
                  <dt className="shrink-0">
                    <Mail aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-5" />
                    <span className="sr-only">{t("emailLabel")}</span>
                  </dt>
                  <dd>
                    {isPlaceholder(COMPANY.email) ? (
                      COMPANY.email
                    ) : (
                      <a href={`mailto:${COMPANY.email}`} className={LINK_CLASSES}>
                        {COMPANY.email}
                      </a>
                    )}
                  </dd>
                </div>
                <div className="flex gap-4">
                  <dt className="shrink-0">
                    <Phone aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-5" />
                    <span className="sr-only">{t("phoneLabel")}</span>
                  </dt>
                  <dd>
                    {isPlaceholder(COMPANY.phone) ? (
                      COMPANY.phone
                    ) : (
                      <a href={toPhoneHref(COMPANY.phone)} className={LINK_CLASSES}>
                        {COMPANY.phone}
                      </a>
                    )}
                  </dd>
                </div>
                <div className="flex gap-4">
                  <dt className="shrink-0">
                    <MapPin aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-5" />
                    <span className="sr-only">{t("locationLabel")}</span>
                  </dt>
                  <dd>{t("location")}</dd>
                </div>
              </dl>
            </section>

            {bookingUrl ? (
              <section
                aria-labelledby="contact-booking-title"
                className="border-t border-border pt-10"
              >
                <h2 id="contact-booking-title" className="text-lg font-semibold tracking-tight">
                  {t("bookingTitle")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t("bookingText")}</p>
                <p className="mt-5">
                  <ExternalLink
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                    className="group inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                  >
                    {t("bookingCta")}
                    <ArrowUpRight
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    />
                    <span className="sr-only">{t("newTab")}</span>
                  </ExternalLink>
                </p>
              </section>
            ) : null}

            <section
              aria-labelledby="contact-project-title"
              className="rounded-lg border border-border bg-surface p-6"
            >
              <h2 id="contact-project-title" className="text-base font-semibold tracking-tight">
                {t("projectTitle")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("projectText")}</p>
              <p className="mt-5">
                <ArrowLink href={PRIMARY_CTA_HREF}>{t("projectCta")}</ArrowLink>
              </p>
            </section>
          </aside>

          <section aria-labelledby="contact-form-title" className="lg:col-span-8">
            <h2 id="contact-form-title" className="text-2xl font-bold tracking-tight">
              {t("formTitle")}
            </h2>
            <div className="mt-8">
              <ContactForm />
            </div>
          </section>
        </Container>
      </div>
    </>
  );
}
