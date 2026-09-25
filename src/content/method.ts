/** Une étape de la méthode. Ses textes sont dans les traductions, bloc « Method.steps.<key> ». */
export type MethodStep = {
  key: string;
  /** Points concrets de l'étape, textes dans « Method.steps.<key>.points ». */
  points: readonly string[];
};

/** Les cinq étapes de la méthode, dans l'ordre du cahier des charges. */
export const METHOD_STEPS = [
  { key: "brief", points: ["channel", "documents", "constraints"] },
  { key: "analysis", points: ["scope", "proposal", "agreement"] },
  { key: "build", points: ["founder", "network", "contract"] },
  { key: "manage", points: ["contact", "progress", "coordination"] },
  { key: "deliver", points: ["quality", "launch", "maintenance"] },
] as const satisfies ReadonlyArray<MethodStep>;

export type MethodStepKey = (typeof METHOD_STEPS)[number]["key"];
