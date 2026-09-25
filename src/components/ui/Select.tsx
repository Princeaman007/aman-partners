import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlStyles } from "./FormField";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  placeholder?: string;
};

export function Select({ className, placeholder, children, defaultValue, ...props }: SelectProps) {
  const isControlled = props.value !== undefined;
  const initialValue =
    placeholder && defaultValue === undefined && !isControlled ? "" : defaultValue;

  return (
    <div className="relative">
      <select
        className={cn(controlStyles, "h-11 cursor-pointer appearance-none pr-10", className)}
        defaultValue={isControlled ? undefined : initialValue}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
