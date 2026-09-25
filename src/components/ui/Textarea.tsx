import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { controlStyles } from "./FormField";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, rows = 5, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(controlStyles, "min-h-32 resize-y py-3 leading-relaxed", className)}
      {...props}
    />
  );
}
