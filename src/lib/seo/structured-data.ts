import { COMPANY, isPlaceholder } from "@/content/company";
import { FOUNDER } from "@/content/founder";
import type { routing } from "@/i18n/routing";
import { getSiteUrl } from "./metadata";

type AppLocale = (typeof routing.locales)[number];

type SchemaObject = { [key: string]: unknown };

const SCHEMA_CONTEXT = "https://schema.org";

/** Adresse complète sur le site. */
function siteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString();
}

/** Identifiant unique de l'entreprise, auquel les autres données font référence. */
export function organizationId(): string {
  return siteUrl("/#organization");
}

/** Langue de la page, au format attendu par Schema.org. */
function schemaLanguage(locale: AppLocale): string {
  return locale === "fr" ? "fr-BE" : "en";
}

/** Coordonnées de l'entreprise, uniquement celles qui sont réellement renseignées. */
function contactDetails(): SchemaObject {
  const details: SchemaObject = {};

  if (!isPlaceholder(COMPANY.email)) {
    details.email = COMPANY.email;
  }
  if (!isPlaceholder(COMPANY.phone)) {
    details.telephone = COMPANY.phone;
  }
  if (!isPlaceholder(COMPANY.companyNumber)) {
    details.identifier = {
      "@type": "PropertyValue",
      propertyID: "BCE",
      value: COMPANY.companyNumber,
    };
  }

  return details;
}

/** L'entreprise : nom, logo, description, fondateur, pays et coordonnées renseignées. */
function buildOrganization(locale: AppLocale, name: string, description: string): SchemaObject {
  return {
    "@type": "Organization",
    "@id": organizationId(),
    name,
    url: siteUrl("/"),
    logo: siteUrl("/apple-icon"),
    image: siteUrl(`/api/og/${locale}`),
    description,
    founder: {
      "@type": "Person",
      name: FOUNDER.name,
      jobTitle: "Full-stack developer",
      sameAs: [FOUNDER.linkedinUrl],
    },
    address: { "@type": "PostalAddress", addressCountry: "BE" },
    knowsLanguage: ["fr", "en"],
    ...contactDetails(),
  };
}

/** Le site Web, publié par l'entreprise. */
function buildWebSite(locale: AppLocale, name: string): SchemaObject {
  return {
    "@type": "WebSite",
    "@id": siteUrl("/#website"),
    url: siteUrl("/"),
    name,
    inLanguage: schemaLanguage(locale),
    publisher: { "@id": organizationId() },
  };
}

/** Données structurées communes à toutes les pages : l'entreprise et le site. */
export function buildSiteStructuredData(
  locale: AppLocale,
  name: string,
  description: string,
): SchemaObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [buildOrganization(locale, name, description), buildWebSite(locale, name)],
  };
}
