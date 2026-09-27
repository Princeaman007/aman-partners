"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { FormAlert } from "@/components/forms/FormAlert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";

/** Formulaire de connexion au dashboard. */
export function LoginForm() {
  const t = useTranslations("Admin.login");
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAction, null);

  let errorMessage: string | null = null;
  if (state?.error === "invalidCredentials") {
    errorMessage = t("invalidCredentials");
  } else if (state?.error === "rateLimited") {
    errorMessage = t("rateLimited", { minutes: state.minutes ?? 15 });
  } else if (state?.error === "serverError") {
    errorMessage = t("serverError");
  }

  return (
    <form action={formAction} className="space-y-6">
      <FormField id="admin-email" label={t("email")} required>
        {(controlProps) => (
          <Input
            {...controlProps}
            name="email"
            type="email"
            autoComplete="username"
            defaultValue={state?.email ?? ""}
          />
        )}
      </FormField>

      <FormField id="admin-password" label={t("password")} required>
        {(controlProps) => (
          <Input
            {...controlProps}
            name="password"
            type="password"
            autoComplete="current-password"
          />
        )}
      </FormField>

      {errorMessage ? <FormAlert>{errorMessage}</FormAlert> : null}

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
