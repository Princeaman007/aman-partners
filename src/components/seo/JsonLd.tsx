type JsonLdProps = {
  data: { [key: string]: unknown };
};

/**
 * Données structurées Schema.org (JSON-LD), lues par les moteurs de recherche.
 * Le caractère « < » est échappé : un texte ne peut jamais refermer la balise script.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
