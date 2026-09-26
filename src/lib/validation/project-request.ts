import { z } from "zod";
import {
  LIMITS,
  choiceField,
  consentField,
  emailField,
  honeypotField,
  optionalPhoneField,
  optionalText,
  requiredText,
  trackingSchema,
} from "./shared";

/** Types de projet, dans l'ordre du cahier des charges (libellés dans « ProjectRequest.projectTypes »). */
export const PROJECT_TYPES = [
  "showcase",
  "ecommerce",
  "webApp",
  "mobileApp",
  "saas",
  "erp",
  "crm",
  "automation",
  "ai",
  "other",
] as const;

/** Fourchettes de budget du cahier des charges (libellés dans « ProjectRequest.budgets »). */
export const BUDGET_RANGES = [
  "under1k",
  "1kTo3k",
  "3kTo5k",
  "5kTo10k",
  "over10k",
  "unknown",
] as const;

/** Délais souhaités (libellés dans « ProjectRequest.timelines »). */
export const TIMELINES = ["asap", "1to3Months", "3to6Months", "over6Months", "flexible"] as const;

/** Réponses oui/non (cahier des charges existant, design existant). */
export const YES_NO = ["yes", "no"] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type BudgetRange = (typeof BUDGET_RANGES)[number];
export type Timeline = (typeof TIMELINES)[number];

/** Étape 1 : informations sur le demandeur. */
export const projectContactStepSchema = z.object({
  lastName: requiredText(LIMITS.name),
  firstName: requiredText(LIMITS.name),
  company: optionalText(LIMITS.company),
  email: emailField,
  phone: optionalPhoneField,
  country: requiredText(LIMITS.country),
});

/** Étape 2 : le projet. La pièce jointe est envoyée à part et vérifiée par validateAttachment. */
export const projectDetailsStepSchema = z.object({
  projectType: choiceField(PROJECT_TYPES),
  description: requiredText(LIMITS.message),
  budget: choiceField(BUDGET_RANGES),
  timeline: choiceField(TIMELINES),
  hasSpecifications: choiceField(YES_NO),
  hasDesign: choiceField(YES_NO),
});

/** Étape 3 : consentement. */
export const projectConsentStepSchema = z.object({
  consent: consentField,
});

/** Demande de projet complète : validée à l'identique dans le navigateur et sur le serveur. */
export const projectRequestSchema = z.object({
  ...projectContactStepSchema.shape,
  ...projectDetailsStepSchema.shape,
  ...projectConsentStepSchema.shape,
  /** Champ piège anti-robots (invisible). */
  website: honeypotField,
  /** Paramètres de campagne, ajoutés automatiquement (phase 6). */
  tracking: trackingSchema,
});

/** Données saisies dans le formulaire, avant nettoyage. */
export type ProjectRequestInput = z.input<typeof projectRequestSchema>;

/** Données validées et nettoyées, telles que le serveur les reçoit. */
export type ProjectRequestData = z.output<typeof projectRequestSchema>;
