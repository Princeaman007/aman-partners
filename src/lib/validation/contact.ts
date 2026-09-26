import { z } from "zod";
import {
  LIMITS,
  consentField,
  emailField,
  honeypotField,
  optionalPhoneField,
  optionalText,
  requiredText,
  trackingSchema,
} from "./shared";

/** Formulaire de contact : validé à l'identique dans le navigateur et sur le serveur. */
export const contactSchema = z.object({
  name: requiredText(LIMITS.name),
  company: optionalText(LIMITS.company),
  email: emailField,
  phone: optionalPhoneField,
  message: requiredText(LIMITS.message),
  consent: consentField,
  /** Champ piège anti-robots (invisible). */
  website: honeypotField,
  /** Paramètres de campagne, ajoutés automatiquement (phase 6). */
  tracking: trackingSchema,
});

/** Données saisies dans le formulaire, avant nettoyage. */
export type ContactInput = z.input<typeof contactSchema>;

/** Données validées et nettoyées, telles que le serveur les reçoit. */
export type ContactData = z.output<typeof contactSchema>;
