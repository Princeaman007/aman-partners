"use client";

import type { InputHTMLAttributes } from "react";
import { useTranslations } from "next-intl";

type HoneypotFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
};

/**
 * Champ piège anti-robots : placé hors de l'écran, ignoré au clavier et par les lecteurs d'écran.
 * Un humain ne le voit jamais ; un robot qui remplit tous les champs se trahit.
 */
export function HoneypotField({ id, ...props }: HoneypotFieldProps) {
  const t = useTranslations("Forms");

  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label htmlFor={id}>{t("honeypotLabel")}</label>
      <input id={id} type="text" tabIndex={-1} autoComplete="off" {...props} />
    </div>
  );
}
