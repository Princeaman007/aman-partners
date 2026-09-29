import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { SERVICES } from "@/content/services";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/seo/metadata";
import { organizationId } from "@/lib/seo/structured-data";
import { JsonLd } from "./JsonLd";

/** Données structurées de la page Services : les cinq services, fournis par l'entreprise. */
export async function ServicesStructuredData() {
  const requested = await getLocale();
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const t = await getTranslations("Services");

  const pageUrl = new URL(getPathname({ href: "/services", locale }), getSiteUrl()).toString();

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SERVICES.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: t(`items.${service.key}.title`),
        serviceType: t(`items.${service.key}.title`),
        description: t(`items.${service.key}.description`),
        url: pageUrl,
        provider: { "@id": organizationId() },
      },
    })),
  };

  return <JsonLd data={data} />;
}
