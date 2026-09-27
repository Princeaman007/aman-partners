import "server-only";
import { NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import type { z } from "zod";
import { routing } from "@/i18n/routing";
import { isValidationErrorKey, type FieldErrors, type FormApiResponse } from "./responses";

export type AppLocale = (typeof routing.locales)[number];

function respond(body: FormApiResponse, status: number, headers?: HeadersInit) {
  return NextResponse.json<FormApiResponse>(body, { status, headers });
}

/** Demande acceptée. */
export function successResponse() {
  return respond({ ok: true }, 200);
}

/** Erreurs de champs déjà identifiées (par exemple une pièce jointe refusée). */
export function fieldErrorsResponse(fieldErrors: FieldErrors) {
  return respond({ ok: false, error: "validation", fieldErrors }, 400);
}

/** Données invalides : la première erreur de chaque champ, sous forme de clé traduisible. */
export function validationErrorResponse(error: z.ZodError) {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || fieldErrors[field]) {
      continue;
    }
    fieldErrors[field] = isValidationErrorKey(issue.message) ? issue.message : "invalidOption";
  }

  return fieldErrorsResponse(fieldErrors);
}

/** Vérification anti-robots échouée. */
export function captchaErrorResponse() {
  return respond({ ok: false, error: "captcha" }, 400);
}

/** Trop d'envois : code 429 et en-tête standard Retry-After. */
export function rateLimitedResponse(retryAfterSeconds: number) {
  return respond({ ok: false, error: "rateLimited", retryAfterSeconds }, 429, {
    "Retry-After": String(retryAfterSeconds),
  });
}

/** Erreur inattendue du serveur : aucun détail technique n'est renvoyé au visiteur. */
export function serverErrorResponse() {
  return respond({ ok: false, error: "server" }, 500);
}

/** Langue envoyée par le formulaire, ou la langue par défaut si elle est absente ou inconnue. */
export function parseLocale(value: unknown): AppLocale {
  return typeof value === "string" && hasLocale(routing.locales, value)
    ? value
    : routing.defaultLocale;
}

/** Lit un champ texte d'un formulaire multipart (les fichiers et champs absents donnent undefined). */
export function readFormText(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

/** Lit les paramètres de campagne, envoyés sous forme de texte JSON. Toute valeur illisible est ignorée. */
export function readFormJson(formData: FormData, name: string): unknown {
  const value = readFormText(formData, name);
  if (!value) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
