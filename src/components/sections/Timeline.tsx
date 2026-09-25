import { getTranslations } from "next-intl/server";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { METHOD_STEPS } from "@/content/method";
import { cn } from "@/lib/utils";

const TITLE_ID = "method-title";

type TimelineStepsProps = {
  /** compact : accueil, horizontale sur ordinateur. detailed : page Méthode, verticale avec les points concrets. */
  variant?: "compact" | "detailed";
  /** Niveau des titres d'étape : h3 sous une section (accueil), h2 directement sous le h1 d'une page. */
  headingLevel?: "h2" | "h3";
  className?: string;
};

/** Liste des étapes de la méthode, reliées par une ligne et les points du symbole. */
export async function TimelineSteps({
  variant = "compact",
  headingLevel = "h3",
  className,
}: TimelineStepsProps) {
  const t = await getTranslations("Method");
  const Heading = headingLevel;
  const isDetailed = variant === "detailed";

  type MethodMessageKey = Parameters<typeof t>[0];

  return (
    <ol className={cn("grid", !isDetailed && "lg:grid-cols-5", className)}>
      {METHOD_STEPS.map((step, index) => {
        const number = index + 1;
        const isLast = number === METHOD_STEPS.length;

        let contentSpacing: string;
        if (isDetailed) {
          contentSpacing = isLast ? "pb-0" : "pb-16";
        } else {
          contentSpacing = isLast ? "pb-0 lg:pt-6" : "pb-10 lg:pt-6 lg:pb-0";
        }

        return (
          <li
            key={step.key}
            className={cn(
              "flex",
              isDetailed ? "gap-6 sm:gap-10" : "gap-5 lg:flex-col lg:gap-0 lg:pr-8",
            )}
          >
            {/* Repère : point, puis ligne vers l'étape suivante */}
            <div
              aria-hidden="true"
              className={cn("flex flex-col items-center", !isDetailed && "lg:-mr-8 lg:flex-row")}
            >
              {isLast ? (
                <span
                  className={cn(
                    "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border border-foreground",
                    !isDetailed && "lg:mt-0",
                  )}
                >
                  <span className="size-1.5 rounded-full bg-foreground" />
                </span>
              ) : (
                <span
                  className={cn(
                    "mt-1.5 size-3 shrink-0 rounded-full bg-foreground",
                    !isDetailed && "lg:mt-0",
                  )}
                />
              )}
              {isLast ? null : (
                <span
                  className={cn(
                    "mt-2 w-px flex-1 bg-border-strong",
                    !isDetailed && "lg:mx-2 lg:mt-0 lg:h-px lg:w-auto",
                  )}
                />
              )}
            </div>

            <div className={contentSpacing}>
              <p className="text-sm font-medium text-muted tabular-nums">
                <span aria-hidden="true">{String(number).padStart(2, "0")}</span>
                <span className="sr-only">{t("stepLabel", { number })}</span>
              </p>

              <Heading
                className={cn(
                  "mt-2 tracking-tight text-balance",
                  isDetailed ? "text-2xl font-bold sm:text-3xl" : "text-lg font-semibold",
                )}
              >
                {t(`steps.${step.key}.title`)}
              </Heading>

              <p
                className={cn(
                  "text-muted",
                  isDetailed
                    ? "mt-4 max-w-2xl text-lg leading-relaxed text-pretty"
                    : "mt-2 text-sm leading-relaxed",
                )}
              >
                {t(`steps.${step.key}.text`)}
              </p>

              {isDetailed ? (
                <div className="mt-8 max-w-2xl">
                  <p className="text-sm font-semibold">{t("pointsLabel")}</p>
                  <ul className="mt-4 space-y-3">
                    {step.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm leading-relaxed text-muted">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1 shrink-0 rounded-full bg-foreground"
                        />
                        {t(`steps.${step.key}.points.${point}` as MethodMessageKey)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Section « Comment ça fonctionne » de la page d'accueil. */
export async function Timeline() {
  const t = await getTranslations("Method");

  return (
    <section aria-labelledby={TITLE_ID} className="border-t border-border py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id={TITLE_ID}
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />
          <ArrowLink href="/methode">{t("learnMore")}</ArrowLink>
        </div>

        <TimelineSteps className="mt-12 lg:mt-16" />
      </Container>
    </section>
  );
}
