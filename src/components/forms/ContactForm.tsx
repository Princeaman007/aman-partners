"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { CircleCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Link } from "@/i18n/navigation";
import {
  isValidationErrorKey,
  type FormAlertKind,
  type FormApiResponse,
} from "@/lib/forms/responses";
import { contactSchema, type ContactData, type ContactInput } from "@/lib/validation/contact";
import { FormAlert } from "./FormAlert";
import { HoneypotField } from "./HoneypotField";
import { TurnstileField } from "./TurnstileField";

/** Champs du formulaire qui peuvent recevoir une erreur renvoyée par le serveur. */
const FIELD_NAMES = ["name", "company", "email", "phone", "message", "consent"] as const;
type FieldName = (typeof FIELD_NAMES)[number];

function isFieldName(value: string): value is FieldName {
  return (FIELD_NAMES as readonly string[]).includes(value);
}

const DEFAULT_VALUES: ContactInput = {
  name: "",
  company: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
  website: "",
};

type AlertState = { kind: FormAlertKind; minutes?: number } | null;

export function ContactForm() {
  const t = useTranslations("ContactForm");
  const tForms = useTranslations("Forms");
  const locale = useLocale();

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const [alert, setAlert] = useState<AlertState>(null);
  const [isSent, setIsSent] = useState(false);
  const successRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  // Après un envoi réussi, le message de confirmation reçoit le focus.
  useEffect(() => {
    if (isSent) {
      successRef.current?.focus();
    }
  }, [isSent]);

  /** Texte traduit de l'erreur d'un champ, s'il y en a une. */
  function fieldError(name: FieldName): string | undefined {
    const key = errors[name]?.message;
    return isValidationErrorKey(key) ? tForms(`errors.${key}`) : undefined;
  }

  /** Un jeton Turnstile ne sert qu'une fois : on en redemande un après chaque tentative. */
  function resetTurnstile() {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }

  async function sendRequest(data: ContactData) {
    setAlert(null);

    if (!turnstileToken) {
      setAlert({ kind: "captcha" });
      return;
    }

    let result: FormApiResponse;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale, turnstileToken }),
      });
      result = (await response.json()) as FormApiResponse;
    } catch {
      setAlert({ kind: "network" });
      resetTurnstile();
      return;
    }

    resetTurnstile();

    if (result.ok) {
      reset(DEFAULT_VALUES);
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

  /** Envoi du formulaire : la validation et l'envoi ne sont lancés qu'au moment du clic. */
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
        <h3
          ref={successRef}
          tabIndex={-1}
          className="mt-4 text-xl font-semibold tracking-tight outline-none"
        >
          {t("successTitle")}
        </h3>
        <p className="mt-2 leading-relaxed text-muted">{t("successText")}</p>
        <Button variant="secondary" size="sm" className="mt-6" onClick={() => setIsSent(false)}>
          {t("sendAnother")}
        </Button>
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

  return (
    <form noValidate onSubmit={handleFormSubmit} className="relative space-y-6">
      <p className="text-sm text-muted">{tForms("requiredNote")}</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="contact-name" label={t("name")} error={fieldError("name")} required>
          {(controlProps) => <Input {...controlProps} {...register("name")} autoComplete="name" />}
        </FormField>

        <FormField id="contact-company" label={t("company")} error={fieldError("company")}>
          {(controlProps) => (
            <Input {...controlProps} {...register("company")} autoComplete="organization" />
          )}
        </FormField>

        <FormField id="contact-email" label={t("email")} error={fieldError("email")} required>
          {(controlProps) => (
            <Input {...controlProps} {...register("email")} type="email" autoComplete="email" />
          )}
        </FormField>

        <FormField id="contact-phone" label={t("phone")} error={fieldError("phone")}>
          {(controlProps) => (
            <Input {...controlProps} {...register("phone")} type="tel" autoComplete="tel" />
          )}
        </FormField>

        <FormField
          id="contact-message"
          label={t("message")}
          hint={t("messageHint")}
          error={fieldError("message")}
          required
          className="sm:col-span-2"
        >
          {(controlProps) => <Textarea {...controlProps} {...register("message")} rows={6} />}
        </FormField>

        <Checkbox
          id="contact-consent"
          label={consentLabel}
          error={fieldError("consent")}
          required
          className="sm:col-span-2"
          {...register("consent")}
        />
      </div>

      <HoneypotField id="contact-website" {...register("website")} />

      <TurnstileField ref={turnstileRef} onToken={setTurnstileToken} />

      {alert ? <FormAlert>{alertMessage(alert)}</FormAlert> : null}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? tForms("sending") : t("submit")}
      </Button>
    </form>
  );
}
