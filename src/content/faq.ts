/** Une question de la FAQ. Sa question et sa réponse sont dans les traductions, bloc « FAQ.items.<key> ». */
export type FaqItem = {
  key: string;
};

/** Les questions de la FAQ, dans l'ordre d'affichage. */
export const FAQ_ITEMS = [
  { key: "cost" },
  { key: "inHouse" },
  { key: "ownSpecs" },
  { key: "manager" },
  { key: "maintenance" },
] as const satisfies ReadonlyArray<FaqItem>;

export type FaqKey = (typeof FAQ_ITEMS)[number]["key"];
