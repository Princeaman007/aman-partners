"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { CircleCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FieldError, FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Link } from "@/i18n/navigation";
import {
  isValidationErrorKey,
  type FormAlertKind,
  type FormApiResponse,
} from "@/lib/forms/responses";
import {
  AVAILABILITIES,
  PARTNER_STATUSES,
  SPECIALTIES,
  partnerApplicationSchema,
  type PartnerApplicationData,
  type PartnerApplicationInput,
} from "@/lib/validation/partner-application";
import { FormAlert } from "./FormAlert";
import { HoneypotField } from "./HoneypotField";
import { TurnstileField } from "./TurnstileField";

/** Champs du formulaire qui peuvent recevoir une erreur renvoyée par le serveur. */
const FIELD_NAMES = [
  "name",
  "email",
  "country",
  "status",
  "availability",
  "specialties",
  "technologies",
  "experienceYears",
  "dailyRate",
  "portfolio",
  "linkedin",
  "github",
  "message",
  "consent",
] as const;
type FieldName = (typeof FIELD_NAMES)[number];

function isFieldName(value: string): value is FieldName {
  return (FIELD_NAMES as readonly string[]).includes(value);
}

const DEFAULT_VALUES: Partial<PartnerApplicationInput> = {
  name: "",
  email: "",
  country: "",
  specialties: [],
  technologies: "",
  experienceYears: "",
  dailyRate: "",
  portfolio: "",
  linkedin: "",
  github: "",
  message: "",
  consent: false,
  website: "",
};

type AlertState = { kind: FormAlertKind; minutes?: number } | null;

const SECTION_CLASSES = "space-y-6 border-t border-border pt-8";
const LEGEND_CLASSES = "mb-6 text-lg font-semibold tracking-tight";

export function PartnerForm() {
  const t = useTranslations("PartnerForm");
  const tForms = useTranslations("Forms");
  const locale = useLocale();

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const [alert, setAlert] = useState<AlertState>(null);
  const [isSent, setIsSent] = useState(false);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Deux formes : les valeurs saisies (texte) et les données validées (expérience en nombre).
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PartnerApplicationInput, unknown, PartnerApplicationData>({
    resolver: zodResolver(partnerApplicationSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  // Après un envoi réussi, le message de confirmation reçoit le focus.
  useEffect(() => {
    if (isSent) {
      successRef.current?.focus();
    }
  }, [isSent]);

  function fieldError(name: FieldName): string | undefined {
    const key = errors[name]?.message;
    return isValidationErrorKey(key) ? tForms(`errors.${key}`) : undefined;
  }

  function resetTurnstile() {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }

  /**
   * Envoi après validation dans le navigateur. On envoie les valeurs saisies (getValues),
   * et non les données transformées : le serveur les revalide avec le même schéma.
   */
  async function sendRequest() {
    setAlert(null);

    if (!turnstileToken) {
      setAlert({ kind: "captcha" });
      return;
    }

    let result: FormApiResponse;
    try {
      const response = await fetch("/api/partner-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...getValues(), locale, turnstileToken }),
      });
      result = (await response.json()) as FormApiResponse;
    } catch {
      setAlert({ kind: "network" });
      resetTurnstile();
      return;
    }

    resetTurnstile();

    if (result.ok) {
      setIsSent(true);
      return;
    }

    switch (result.error) {
      case "validation":
        for (const [field, key] of Object.entries(result.fieldErrors)) {
          if (key && isFieldName(field)) {
            setError(field, { type: "server", message: key });
          }
        }
        setAlert({ kind: "fixErrors" });
        break;
      case "captcha":
        setAlert({ kind: "captcha" });
        break;
      case "rateLimited":
        setAlert({ kind: "rateLimited", minutes: Math.ceil(result.retryAfterSeconds / 60) });
        break;
      default:
        setAlert({ kind: "server" });
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(sendRequest, () => setAlert({ kind: "fixErrors" }))(event);
  }

  function alertMessage(state: NonNullable<AlertState>): string {
    switch (state.kind) {
      case "fixErrors":
        return tForms("fixErrors");
      case "captcha":
        return tForms("captchaError");
      case "rateLimited":
        return tForms("rateLimited", { minutes: state.minutes ?? 60 });
      case "network":
        return tForms("networkError");
      default:
        return tForms("serverError");
    }
  }

  if (isSent) {
    return (
      <div role="status" className="rounded-lg border border-border bg-surface p-6 sm:p-8">
        <CircleCheck aria-hidden="true" strokeWidth={1.5} className="size-8" />
        <h2
          ref={successRef}
          tabIndex={-1}
          className="mt-4 text-xl font-semibold tracking-tight outline-none"
        >
          {t("successTitle")}
        </h2>
        <p className="mt-2 leading-relaxed text-muted">{t("successText")}</p>
      </div>
    );
  }

  const consentLabel = tForms.rich("consentLabel", {
    link: (chunks) => (
      <Link
        href="/confidentialite"
        className="rounded-sm font-semibold underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        {chunks}
      </Link>
    ),
  });

  const specialtiesError = fieldError("specialties");
  const specialtiesHintId = "partner-specialties-hint";
  const specialtiesErrorId = specialtiesError ? "partner-specialties-error" : undefined;

  return (
    <form noValidate onSubmit={handleFormSubmit} className="relative space-y-10">
      <p className="text-sm text-muted">{tForms("requiredNote")}</p>

      {/* Groupe 1 : le profil */}
      <fieldset className={SECTION_CLASSES}>
        <legend className={LEGEND_CLASSES}>{t("profileTitle")}</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            id="partner-name"
            label={t("name")}
            error={fieldError("name")}
            required
            className="sm:col-span-2"
          >
            {(controlProps) => (
              <Input {...controlProps} {...register("name")} autoComplete="name" />
            )}
          </FormField>
          <FormField id="partner-email" label={t("email")} error={fieldError("email")} required>
            {(controlProps) => (
              <Input {...controlProps} {...register("email")} type="email" autoComplete="email" />
            )}
          </FormField>
          <FormField
            id="partner-country"
            label={t("country")}
            error={fieldError("country")}
            required
          >
            {(controlProps) => (
              <Input {...controlProps} {...register("country")} autoComplete="country-name" />
            )}
          </FormField>
          <FormField id="partner-status" label={t("status")} error={fieldError("status")} required>
            {(controlProps) => (
              <Select
                {...controlProps}
                {...register("status")}
                placeholder={t("statusPlaceholder")}
              >
                {PARTNER_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {t(`statuses.${value}`)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField
            id="partner-availability"
            label={t("availability")}
            error={fieldError("availability")}
            required
          >
            {(controlProps) => (
              <Select
                {...controlProps}
                {...register("availability")}
                placeholder={t("availabilityPlaceholder")}
              >
                {AVAILABILITIES.map((value) => (
                  <option key={value} value={value}>
                    {t(`availabilities.${value}`)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>
      </fieldset>

      {/* Groupe 2 : les compétences */}
      <fieldset className={SECTION_CLASSES}>
        <legend className={LEGEND_CLASSES}>{t("skillsTitle")}</legend>

        <fieldset
          aria-describedby={[specialtiesHintId, specialtiesErrorId].filter(Boolean).join(" ")}
          className="space-y-3"
        >
          <legend className="text-sm font-medium text-foreground">
            {t("specialties")}
            <span aria-hidden="true" className="ml-0.5">
              *
            </span>
          </legend>
          <p id={specialtiesHintId} className="text-sm text-muted">
            {t("specialtiesHint")}
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {SPECIALTIES.map((value) => (
              <Checkbox
                key={value}
                id={`partner-specialty-${value}`}
                label={t(`specialtyOptions.${value}`)}
                value={value}
                {...register("specialties")}
              />
            ))}
          </div>
          {specialtiesError ? (
            <FieldError id={specialtiesErrorId}>{specialtiesError}</FieldError>
          ) : null}
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            id="partner-technologies"
            label={t("technologies")}
            hint={t("technologiesHint")}
            error={fieldError("technologies")}
            required
            className="sm:col-span-2"
          >
            {(controlProps) => <Input {...controlProps} {...register("technologies")} />}
          </FormField>
          <FormField
            id="partner-experience"
            label={t("experienceYears")}
            error={fieldError("experienceYears")}
            required
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                {...register("experienceYears")}
                inputMode="numeric"
                maxLength={2}
              />
            )}
          </FormField>
          <FormField
            id="partner-daily-rate"
            label={t("dailyRate")}
            hint={t("dailyRateHint")}
            error={fieldError("dailyRate")}
          >
            {(controlProps) => <Input {...controlProps} {...register("dailyRate")} />}
          </FormField>
        </div>
      </fieldset>

      {/* Groupe 3 : les liens et le message */}
      <fieldset className={SECTION_CLASSES}>
        <legend className={LEGEND_CLASSES}>{t("linksTitle")}</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            id="partner-portfolio"
            label={t("portfolio")}
            hint={t("urlHint")}
            error={fieldError("portfolio")}
            className="sm:col-span-2"
          >
            {(controlProps) => (
              <Input {...controlProps} {...register("portfolio")} type="url" autoComplete="url" />
            )}
          </FormField>
          <FormField id="partner-linkedin" label={t("linkedin")} error={fieldError("linkedin")}>
            {(controlProps) => <Input {...controlProps} {...register("linkedin")} type="url" />}
          </FormField>
          <FormField id="partner-github" label={t("github")} error={fieldError("github")}>
            {(controlProps) => <Input {...controlProps} {...register("github")} type="url" />}
          </FormField>
          <FormField
            id="partner-message"
            label={t("message")}
            hint={t("messageHint")}
            error={fieldError("message")}
            className="sm:col-span-2"
          >
            {(controlProps) => <Textarea {...controlProps} {...register("message")} rows={5} />}
          </FormField>
        </div>
      </fieldset>

      <div className="space-y-6 border-t border-border pt-8">
        <Checkbox
          id="partner-consent"
          label={consentLabel}
          error={fieldError("consent")}
          required
          {...register("consent")}
        />

        <HoneypotField id="partner-website" {...register("website")} />

        <TurnstileField ref={turnstileRef} onToken={setTurnstileToken} />

        {alert ? <FormAlert>{alertMessage(alert)}</FormAlert> : null}

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? tForms("sending") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
