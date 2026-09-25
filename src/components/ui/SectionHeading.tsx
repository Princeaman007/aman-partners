import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2";

type SectionHeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  as?: HeadingLevel;
  id?: string;
  className?: string;
};

const TITLE_SIZES: Record<HeadingLevel, string> = {
  h1: "text-4xl sm:text-5xl",
  h2: "text-3xl sm:text-4xl",
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={cn("max-w-2xl", isCenter && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p
          className={cn(
            "flex items-center gap-2 text-sm font-medium text-muted",
            isCenter && "justify-center",
          )}
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-foreground" />
          {eyebrow}
        </p>
      ) : null}
      <Heading
        id={id}
        className={cn(
          "font-bold tracking-tight text-balance",
          TITLE_SIZES[Heading],
          eyebrow ? "mt-3" : undefined,
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p className="mt-4 text-lg leading-relaxed text-pretty text-muted">{description}</p>
      ) : null}
    </div>
  );
}
