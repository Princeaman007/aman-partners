import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "subtle" | "outline" | "solid";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const VARIANTS: Record<BadgeVariant, string> = {
  subtle: "bg-foreground/5 text-foreground",
  outline: "border border-border-strong text-foreground",
  solid: "bg-primary text-primary-foreground",
};

export function Badge({ variant = "subtle", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
