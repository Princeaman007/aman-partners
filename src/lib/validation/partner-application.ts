import { z } from "zod";
import {
  LIMITS,
  choiceField,
  consentField,
  emailField,
  honeypotField,
  optionalText,
  optionalUrlField,
  requiredText,
} from "./shared";

/** Statuts du candidat (libellés dans « PartnerApplication.statuses »). */
export const PARTNER_STATUSES = ["freelance", "agency", "other"] as const;

/** Spécialités, dans l'ordre du cahier des charges (libellés dans « PartnerApplication.specialties »). */
export const SPECIALTIES = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "uiux",
  "wordpress",
  "shopify",
  "dotnet",
  "java",
  "php",
  "nodejs",
  "python",
  "devops",
  "cloud",
  "ai",
] as const;

/** Disponibilités (libellés dans « PartnerApplication.availabilities »). */
export const AVAILABILITIES = ["now", "withinMonth", "withinThreeMonths", "later"] as const;

export type PartnerStatus = (typeof PARTNER_STATUSES)[number];
export type Specialty = (typeof SPECIALTIES)[number];
export type Availability = (typeof AVAILABILITIES)[number];

/** Années d'expérience : un nombre entier de 0 à 60, saisi comme texte dans le formulaire. */
const experienceField = z
  .string()
  .trim()
  .min(1, "required")
  .regex(/^\d{1,2}$/, "invalidNumber")
  .transform(Number)
  .refine((years) => years <= 60, "invalidNumber");

/** Candidature partenaire : validée à l'identique dans le navigateur et sur le serveur. */
export const partnerApplicationSchema = z.object({
  name: requiredText(LIMITS.name),
  email: emailField,
  country: requiredText(LIMITS.country),
  status: choiceField(PARTNER_STATUSES),
  specialties: z
    .array(z.enum(SPECIALTIES, "invalidOption"))
    .min(1, "selectAtLeastOne")
    .max(SPECIALTIES.length, "invalidOption"),
  technologies: requiredText(LIMITS.shortText),
  experienceYears: experienceField,
  portfolio: optionalUrlField,
  dailyRate: optionalText(LIMITS.shortText),
  availability: choiceField(AVAILABILITIES),
  linkedin: optionalUrlField,
  github: optionalUrlField,
  message: optionalText(LIMITS.message),
  consent: consentField,
  /** Champ piège anti-robots (invisible). */
  website: honeypotField,
});

/** Données saisies dans le formulaire, avant nettoyage. */
export type PartnerApplicationInput = z.input<typeof partnerApplicationSchema>;

/** Données validées et nettoyées, telles que le serveur les reçoit. */
export type PartnerApplicationData = z.output<typeof partnerApplicationSchema>;
