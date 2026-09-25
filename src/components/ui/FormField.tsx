import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Styles communs aux champs de saisie (Input, Textarea, Select). */
export const controlStyles =
  "block w-full rounded-md border border-border-strong bg-background px-3.5 text-base text-foreground " +
  "placeholder:text-muted transition-colors duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "aria-invalid:border-foreground aria-invalid:ring-1 aria-invalid:ring-foreground";

export type ControlProps = {
  id: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

type FormFieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: (controlProps: ControlProps) => ReactNode;
};

export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5">
            *
          </span>
        ) : null}
      </label>
      {children({
        id,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

type FieldErrorProps = {
  id?: string;
  children: ReactNode;
};

export function FieldError({ id, children }: FieldErrorProps) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium text-foreground">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <span>{children}</span>
    </p>
  );
}
