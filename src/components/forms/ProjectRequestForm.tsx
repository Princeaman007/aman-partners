"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { CircleCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FileUpload } from "@/components/ui/FileUpload";
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
  BUDGET_RANGES,
  PROJECT_TYPES,
  TIMELINES,
  YES_NO,
  projectRequestSchema,
  type ProjectRequestData,
  type ProjectRequestInput,
} from "@/lib/validation/project-request";
import { ATTACHMENT, validateAttachment, type ValidationErrorKey } from "@/lib/validation/shared";
import { FormAlert } from "./FormAlert";
import { HoneypotField } from "./HoneypotField";
import { TurnstileField } from "./TurnstileField";

/** Les trois étapes du formulaire, et les champs vérifiés à chacune. */
const STEPS = ["contact", "project", "confirm"] as const;
const STEP_FIELDS = [
  ["lastName", "firstName", "company", "email", "phone", "country"],
  ["projectType", "description", "budget", "timeline", "hasSpecifications", "hasDesign"],
  ["consent"],
] as const;
const LAST_STEP = STEPS.length - 1;
const ATTACHMENT_STEP = 1;

type FieldName = (typeof STEP_FIELDS)[number][number];

function stepOfField(field: string): number {
  return STEP_FIELDS.findIndex((fields) => (fields as readonly string[]).includes(field));
}

function isFieldName(value: string): value is FieldName {
  return stepOfField(value) !== -1;
}

const DEFAULT_VALUES: Partial<ProjectRequestInput> = {
  lastName: "",
  firstName: "",
  company: "",
  email: "",
  phone: "",
  country: "",
  description: "",
  consent: false,
  website: "",
};

type AlertState = { kind: FormAlertKind; minutes?: number } | null;

type Summary = {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  timeline: string;
};

type YesNoFieldProps = {
  id: string;
  legend: string;
  error?: string;
  registration: UseFormRegisterReturn;
  labels: Record<(typeof YES_NO)[number], string>;
};

/**
 * Question oui/non, sous forme de boutons radio regroupés.
 * L'erreur éventuelle concerne tout le groupe : elle est reliée au fieldset.
 */
function YesNoField({ id, legend, error, registration, labels }: YesNoFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <fieldset aria-describedby={errorId} className="space-y-3">
      <legend className="text-sm font-medium text-foreground">
        {legend}
        <span aria-hidden="true" className="ml-0.5">
          *
        </span>
      </legend>
      <div className="flex gap-8">
        {YES_NO.map((value) => (
          <label
            key={value}
            className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
          >
            <input
              type="radio"
              value={value}
              className="size-4 cursor-pointer accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              {...registration}
            />
            {labels[value]}
          </label>
        ))}
      </div>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </fieldset>
  );
}

export function ProjectRequestForm() {
  const t = useTranslations("ProjectRequestForm");
  const tForms = useTranslations("Forms");
  const locale = useLocale();

  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<ValidationErrorKey | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>(null);
  const [isSent, setIsSent] = useState(false);

  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);

  /** Clé de l'étape en cours, toujours définie (repli sur la première étape). */
  const currentStepKey = STEPS[step] ?? "contact";

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectRequestInput, unknown, ProjectRequestData>({
    resolver: zodResolver(projectRequestSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  // À chaque changement d'étape demandé par le visiteur, le focus va sur le titre de l'étape.
  useEffect(() => {
    if (hasNavigated.current) {
      stepHeadingRef.current?.focus();
    }
  }, [step]);

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

  function goToStep(next: number) {
    hasNavigated.current = true;
    setAlert(null);
    setStep(next);
  }

  /** Récapitulatif affiché à la dernière étape, calculé au moment d'y arriver. */
  function buildSummary(): Summary {
    const values = getValues();
    return {
      name: `${values.firstName ?? ""} ${values.lastName ?? ""}`.trim(),
      email: values.email ?? "",
      projectType: values.projectType ? t(`projectTypes.${values.projectType}`) : "",
      budget: values.budget ? t(`budgets.${values.budget}`) : "",
      timeline: values.timeline ? t(`timelines.${values.timeline}`) : "",
    };
  }

  async function goNext() {
    const fields = STEP_FIELDS[step];
    const isValid = fields ? await trigger(fields) : true;
    const attachmentOk = step !== ATTACHMENT_STEP || attachmentError === null;

    if (!isValid || !attachmentOk) {
      setAlert({ kind: "fixErrors" });
      return;
    }

    if (step + 1 === LAST_STEP) {
      setSummary(buildSummary());
    }
    goToStep(step + 1);
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAttachment(file);
    setAttachmentError(file ? validateAttachment(file) : null);
  }

  function resetTurnstile() {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }

  async function sendRequest(data: ProjectRequestData) {
    setAlert(null);

    if (!turnstileToken) {
      setAlert({ kind: "captcha" });
      return;
    }

    const formData = new FormData();
    formData.set("lastName", data.lastName);
    formData.set("firstName", data.firstName);
    formData.set("company", data.company);
    formData.set("email", data.email);
    formData.set("phone", data.phone);
    formData.set("country", data.country);
    formData.set("projectType", data.projectType);
    formData.set("description", data.description);
    formData.set("budget", data.budget);
    formData.set("timeline", data.timeline);
    formData.set("hasSpecifications", data.hasSpecifications);
    formData.set("hasDesign", data.hasDesign);
    formData.set("consent", String(data.consent));
    formData.set("website", data.website ?? "");
    formData.set("locale", locale);
    formData.set("turnstileToken", turnstileToken);
    if (attachment) {
      formData.set("attachment", attachment);
    }

    let result: FormApiResponse;
    try {
      const response = await fetch("/api/project-request", { method: "POST", body: formData });
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
      case "validation": {
        let firstStep = LAST_STEP;
        for (const [field, key] of Object.entries(result.fieldErrors)) {
          if (!key) {
            continue;
          }
          if (field === "attachment") {
            setAttachmentError(key);
            firstStep = Math.min(firstStep, ATTACHMENT_STEP);
          } else if (isFieldName(field)) {
            setError(field, { type: "server", message: key });
            firstStep = Math.min(firstStep, stepOfField(field));
          }
        }
        goToStep(firstStep);
        setAlert({ kind: "fixErrors" });
        break;
      }
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

  /** « Continuer » aux premières étapes, envoi à la dernière. */
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (step < LAST_STEP) {
      event.preventDefault();
      void goNext();
      return;
    }
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

  const yesNoLabels = { yes: t("yes"), no: t("no") };
  const attachmentErrorText = attachmentError ? tForms(`errors.${attachmentError}`) : undefined;

  return (
    <form noValidate onSubmit={handleFormSubmit} className="relative space-y-8">
      {/* Indicateur de progression */}
      <div>
        <p className="text-sm font-medium text-muted">
          {t("stepCounter", { current: step + 1, total: STEPS.length })}
        </p>
        <ol className="mt-3 grid grid-cols-3 gap-2">
          {STEPS.map((key, index) => (
            <li
              key={key}
              aria-current={index === step ? "step" : undefined}
              className="border-t-2 pt-2 text-xs font-medium sm:text-sm"
              style={{ borderColor: index <= step ? "var(--color-foreground)" : undefined }}
            >
              <span className={index <= step ? "text-foreground" : "text-muted"}>
                {t(`steps.${key}`)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <h2
        ref={stepHeadingRef}
        tabIndex={-1}
        className="text-2xl font-bold tracking-tight outline-none"
      >
        {t(`steps.${currentStepKey}`)}
      </h2>

      <p className="text-sm text-muted">{tForms("requiredNote")}</p>

      {/* Étape 1 : informations */}
      <div hidden={step !== 0} className="grid gap-6 sm:grid-cols-2">
        <FormField
          id="project-last-name"
          label={t("lastName")}
          error={fieldError("lastName")}
          required
        >
          {(controlProps) => (
            <Input {...controlProps} {...register("lastName")} autoComplete="family-name" />
          )}
        </FormField>
        <FormField
          id="project-first-name"
          label={t("firstName")}
          error={fieldError("firstName")}
          required
        >
          {(controlProps) => (
            <Input {...controlProps} {...register("firstName")} autoComplete="given-name" />
          )}
        </FormField>
        <FormField id="project-company" label={t("company")} error={fieldError("company")}>
          {(controlProps) => (
            <Input {...controlProps} {...register("company")} autoComplete="organization" />
          )}
        </FormField>
        <FormField id="project-country" label={t("country")} error={fieldError("country")} required>
          {(controlProps) => (
            <Input {...controlProps} {...register("country")} autoComplete="country-name" />
          )}
        </FormField>
        <FormField id="project-email" label={t("email")} error={fieldError("email")} required>
          {(controlProps) => (
            <Input {...controlProps} {...register("email")} type="email" autoComplete="email" />
          )}
        </FormField>
        <FormField id="project-phone" label={t("phone")} error={fieldError("phone")}>
          {(controlProps) => (
            <Input {...controlProps} {...register("phone")} type="tel" autoComplete="tel" />
          )}
        </FormField>
      </div>

      {/* Étape 2 : le projet */}
      <div hidden={step !== 1} className="grid gap-6 sm:grid-cols-2">
        <FormField
          id="project-type"
          label={t("projectType")}
          error={fieldError("projectType")}
          required
          className="sm:col-span-2"
        >
          {(controlProps) => (
            <Select
              {...controlProps}
              {...register("projectType")}
              placeholder={t("projectTypePlaceholder")}
            >
              {PROJECT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`projectTypes.${value}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField
          id="project-description"
          label={t("description")}
          hint={t("descriptionHint")}
          error={fieldError("description")}
          required
          className="sm:col-span-2"
        >
          {(controlProps) => <Textarea {...controlProps} {...register("description")} rows={7} />}
        </FormField>
        <FormField id="project-budget" label={t("budget")} error={fieldError("budget")} required>
          {(controlProps) => (
            <Select {...controlProps} {...register("budget")} placeholder={t("budgetPlaceholder")}>
              {BUDGET_RANGES.map((value) => (
                <option key={value} value={value}>
                  {t(`budgets.${value}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField
          id="project-timeline"
          label={t("timeline")}
          error={fieldError("timeline")}
          required
        >
          {(controlProps) => (
            <Select
              {...controlProps}
              {...register("timeline")}
              placeholder={t("timelinePlaceholder")}
            >
              {TIMELINES.map((value) => (
                <option key={value} value={value}>
                  {t(`timelines.${value}`)}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <YesNoField
          id="project-has-specifications"
          legend={t("hasSpecifications")}
          error={fieldError("hasSpecifications")}
          registration={register("hasSpecifications")}
          labels={yesNoLabels}
        />
        <YesNoField
          id="project-has-design"
          legend={t("hasDesign")}
          error={fieldError("hasDesign")}
          registration={register("hasDesign")}
          labels={yesNoLabels}
        />
        <FileUpload
          id="project-attachment"
          label={t("attachment")}
          hint={t("attachmentHint")}
          error={attachmentErrorText}
          accept={ATTACHMENT.extensions.join(",")}
          onChange={handleAttachmentChange}
          className="sm:col-span-2"
        />
      </div>

      {/* Étape 3 : récapitulatif et consentement */}
      <div hidden={step !== LAST_STEP} className="space-y-6">
        {summary ? (
          <section
            aria-labelledby="project-summary-title"
            className="rounded-lg border border-border bg-surface p-6"
          >
            <h3 id="project-summary-title" className="text-base font-semibold tracking-tight">
              {t("summaryTitle")}
            </h3>
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">
                  {t("firstName")} / {t("lastName")}
                </dt>
                <dd className="mt-0.5 font-medium">{summary.name}</dd>
              </div>
              <div>
                <dt className="text-muted">{t("email")}</dt>
                <dd className="mt-0.5 font-medium break-all">{summary.email}</dd>
              </div>
              <div>
                <dt className="text-muted">{t("projectType")}</dt>
                <dd className="mt-0.5 font-medium">{summary.projectType}</dd>
              </div>
              <div>
                <dt className="text-muted">{t("budget")}</dt>
                <dd className="mt-0.5 font-medium">{summary.budget}</dd>
              </div>
              <div>
                <dt className="text-muted">{t("timeline")}</dt>
                <dd className="mt-0.5 font-medium">{summary.timeline}</dd>
              </div>
              <div>
                <dt className="text-muted">{t("attachment")}</dt>
                <dd className="mt-0.5 font-medium break-all">
                  {attachment ? attachment.name : t("noAttachment")}
                </dd>
              </div>
            </dl>
          </section>
        ) : null}

        <Checkbox
          id="project-consent"
          label={consentLabel}
          error={fieldError("consent")}
          required
          {...register("consent")}
        />

        {step === LAST_STEP ? (
          <TurnstileField ref={turnstileRef} onToken={setTurnstileToken} />
        ) : null}
      </div>

      <HoneypotField id="project-website" {...register("website")} />

      {alert ? <FormAlert>{alertMessage(alert)}</FormAlert> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <Button type="button" variant="ghost" size="lg" onClick={() => goToStep(step - 1)}>
            {t("previous")}
          </Button>
        ) : (
          <span aria-hidden="true" />
        )}
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {step < LAST_STEP ? t("next") : isSubmitting ? tForms("sending") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
