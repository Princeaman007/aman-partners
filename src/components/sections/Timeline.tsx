import { getTranslations } from "next-intl/server";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const TITLE_ID = "method-title";

/** Les cinq étapes de la méthode, dans l'ordre (textes dans « Method.steps »). */
const STEPS = ["brief", "analysis", "build", "manage", "deliver"] as const;

type TimelineStepsProps = {
  /** Niveau des titres d'étape : h3 sous une section (accueil), h2 directement sous le h1 d'une page. */
  headingLevel?: "h2" | "h3";
  className?: string;
};

/** Liste des étapes de la méthode, horizontale sur ordinateur, verticale sur petit écran. */
export async function TimelineSteps({ headingLevel = "h3", className }: TimelineStepsProps) {
  const t = await getTranslations("Method");
  const Heading = headingLevel;

  return (
    <ol className={cn("grid lg:grid-cols-5", className)}>
      {STEPS.map((key, index) => {
        const number = index + 1;
        const isLast = number === STEPS.length;

        return (
          <li key={key} className="flex gap-5 lg:flex-col lg:gap-0 lg:pr-8">
            {/* Repère : point, puis ligne vers l'étape suivante */}
            <div aria-hidden="true" className="flex flex-col items-center lg:-mr-8 lg:flex-row">
              {isLast ? (
                <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border border-foreground lg:mt-0">
                  <span className="size-1.5 rounded-full bg-foreground" />
                </span>
              ) : (
                <span className="mt-1.5 size-3 shrink-0 rounded-full bg-foreground lg:mt-0" />
              )}
              {isLast ? null : (
                <span className="mt-2 w-px flex-1 bg-border-strong lg:mx-2 lg:mt-0 lg:h-px lg:w-auto" />
              )}
            </div>

            <div className={cn("pb-10 lg:pt-6 lg:pb-0", isLast && "pb-0")}>
              <p className="text-sm font-medium text-muted tabular-nums">
                <span aria-hidden="true">{String(number).padStart(2, "0")}</span>
                <span className="sr-only">{t("stepLabel", { number })}</span>
              </p>
              <Heading className="mt-2 text-lg font-semibold tracking-tight text-balance">
                {t(`steps.${key}.title`)}
              </Heading>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`steps.${key}.text`)}</p>
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
