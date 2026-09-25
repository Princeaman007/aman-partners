import type { ComponentProps } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ArrowLinkProps = ComponentProps<typeof Link>;

/** Lien texte suivi d'une flèche qui avance légèrement au survol. */
export function ArrowLink({ className, children, ...props }: ArrowLinkProps) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </Link>
  );
}
