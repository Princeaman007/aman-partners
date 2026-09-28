import { z } from "zod";

/** Un bloc de contenu d'un document légal : paragraphe, liste ou tableau. */
const legalBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string() }),
  z.object({ type: z.literal("list"), items: z.array(z.string()) }),
  z.object({
    type: z.literal("table"),
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),
]);

const legalSectionSchema = z.object({
  title: z.string(),
  blocks: z.array(legalBlockSchema),
});

const legalSectionsSchema = z.record(z.string(), legalSectionSchema);

/** Documents légaux du site, tels qu'ils sont nommés dans les fichiers de traduction. */
export type LegalDocumentKey = "notice" | "privacy" | "cookies";

export type LegalBlock = z.infer<typeof legalBlockSchema>;

export type LegalSection = {
  /** Identifiant de la section, utilisé par le sommaire (ancre). */
  id: string;
  title: string;
  blocks: LegalBlock[];
};

/** Lit une valeur dans un objet imbriqué, en suivant un chemin de clés. */
function readPath(source: unknown, path: readonly string[]): unknown {
  let current: unknown = source;

  for (const key of path) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }
    current = (current as { [key: string]: unknown })[key];
  }

  return current;
}

/**
 * Sections d'un document légal, lues dans l'ensemble des traductions de la langue
 * (Legal.<document>.sections), puis vérifiées. L'ordre est celui du fichier de traduction.
 */
export function getLegalSections(messages: unknown, document: LegalDocumentKey): LegalSection[] {
  const sections = legalSectionsSchema.parse(readPath(messages, ["Legal", document, "sections"]));

  return Object.entries(sections).map(([key, section]) => ({
    id: `legal-${key}`,
    title: section.title,
    blocks: section.blocks,
  }));
}
