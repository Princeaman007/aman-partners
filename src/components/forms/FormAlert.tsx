import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

type FormAlertProps = {
  children: ReactNode;
};

/** Message d'erreur général d'un formulaire, annoncé immédiatement par les lecteurs d'écran. */
export function FormAlert({ children }: FormAlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-foreground px-4 py-3 text-sm font-medium"
    >
      <CircleAlert aria-hidden="true" strokeWidth={2} className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
