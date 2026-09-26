import type { ValidationErrorKey } from "@/lib/validation/shared";

/** Toutes les clés d'erreur de validation, pour vérifier une valeur reçue. */
const VALIDATION_ERROR_KEYS = [
  "required",
  "tooLong",
  "invalidEmail",
  "invalidPhone",
  "invalidUrl",
  "invalidOption",
  "selectAtLeastOne",
  "consentRequired",
  "invalidNumber",
  "fileTooLarge",
  "invalidFileType",
] as const satisfies readonly ValidationErrorKey[];

/** Indique si une valeur est une clé d'erreur connue (et donc traduisible). */
export function isValidationErrorKey(value: unknown): value is ValidationErrorKey {
  return typeof value === "string" && (VALIDATION_ERROR_KEYS as readonly string[]).includes(value);
}

/** Erreurs de validation, champ par champ. */
export type FieldErrors = Partial<Record<string, ValidationErrorKey>>;

/** Réponse de l'API d'un formulaire, identique pour les trois formulaires du site. */
export type FormApiResponse =
  | { ok: true }
  | { ok: false; error: "validation"; fieldErrors: FieldErrors }
  | { ok: false; error: "captcha" }
  | { ok: false; error: "rateLimited"; retryAfterSeconds: number }
  | { ok: false; error: "server" };

/** Erreur générale à afficher au-dessus du bouton d'envoi. */
export type FormAlertKind = "fixErrors" | "captcha" | "rateLimited" | "network" | "server";
