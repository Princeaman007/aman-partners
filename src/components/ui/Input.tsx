import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { controlStyles } from "./FormField";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", ...props }: InputProps) {
  return <input type={type} className={cn(controlStyles, "h-11", className)} {...props} />;
}
