import { getTranslations } from "next-intl/server";
import { FAQ_ITEMS } from "@/content/faq";
import { JsonLd } from "./JsonLd";

/** Données structurées de la FAQ : les questions et réponses affichées sur la page. */
export async function FaqStructuredData() {
  const t = await getTranslations("FAQ");

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(({ key }) => ({
      "@type": "Question",
      name: t(`items.${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`items.${key}.answer`),
      },
    })),
  };

  return <JsonLd data={data} />;
}
