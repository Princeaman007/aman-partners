import type { InputHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldError } from "./FormField";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
  label: ReactNode;
  error?: ReactNode;
};

export function Checkbox({ id, label, error, required, className, ...props }: CheckboxProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start gap-3">
        <span className="relative mt-0.5 flex size-5 shrink-0">
          <input
            id={id}
            type="checkbox"
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              "peer size-5 cursor-pointer appearance-none rounded-sm border border-border-strong bg-background",
              "transition-colors duration-150 checked:border-primary checked:bg-primary",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "aria-invalid:border-foreground aria-invalid:ring-1 aria-invalid:ring-foreground",
            )}
            {...props}
          />
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className="pointer-events-none absolute inset-0 m-auto size-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
          />
        </span>
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-foreground">
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5">
              *
            </span>
          ) : null}
        </label>
      </div>
      {error ? (
        <div className="pl-8">
          <FieldError id={errorId}>{error}</FieldError>
        </div>
      ) : null}
    </div>
  );
}
