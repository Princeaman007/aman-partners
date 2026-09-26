"use client";

import type { Ref } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useLocale } from "next-intl";

type TurnstileFieldProps = {
  /** Reçoit le jeton quand le visiteur est validé, ou null s'il expire ou échoue. */
  onToken: (token: string | null) => void;
  /** Permet au formulaire de redemander un jeton après un envoi (un jeton ne sert qu'une fois). */
  ref?: Ref<TurnstileInstance | undefined>;
};

/** Widget Cloudflare Turnstile : vérification anti-robots, le plus souvent sans action du visiteur. */
export function TurnstileField({ onToken, ref }: TurnstileFieldProps) {
  const locale = useLocale();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return null;
  }

  return (
    <Turnstile
      ref={ref}
      siteKey={siteKey}
      options={{ language: locale, theme: "auto", size: "flexible" }}
      onSuccess={onToken}
      onExpire={() => onToken(null)}
      onError={() => onToken(null)}
    />
  );
}
