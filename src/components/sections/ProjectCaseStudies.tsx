import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import ExternalLink from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { PUBLISHED_PROJECTS } from "@/content/projects";

/**
 * Renvoie la valeur telle quelle, avec le type « présente ou null ».
 * Évite que TypeScript considère une donnée comme toujours présente ou toujours absente
 * d'après le projet actuel : le composant gère ainsi les deux cas pour tout futur projet.
 */
function optional<T>(value: T | null): T | null {
  return value;
}

/** Repère visible pour une information manquante, à remplacer avant la mise en ligne. */
function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-sm border border-dashed border-border-strong px-2 py-1 text-sm font-medium text-muted">
      {children}
    </span>
  );
}

type FactProps = {
  label: string;
  children: ReactNode;
};

/** Une rubrique de l'étude de cas : intitulé et contenu. */
function Fact({ label, children }: FactProps) {
  return (
    <div className="bg-background p-6 sm:p-8">
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className="mt-3 text-sm leading-relaxed text-muted">{children}</dd>
    </div>
  );
}

/** Études de cas des projets publiés : présentation, capture et rubriques du cahier des charges. */
export async function ProjectCaseStudies() {
  const t = await getTranslations("Projects");
  const tPage = await getTranslations("WorkPage");

  type ProjectsMessageKey = Parameters<typeof t>[0];

  return (
    <ul className="space-y-24">
      {PUBLISHED_PROJECTS.map((project) => {
        const titleId = `project-${project.key}-title`;

        const image = optional<StaticImageData>(project.image);
        const features = optional<readonly string[]>(project.features);
        const technologies = optional<readonly string[]>(project.technologies);

        return (
          <li key={project.key}>
            <article aria-labelledby={titleId}>
              <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-medium text-muted">
                      {t(`items.${project.key}.category`)}
                    </p>
                    {project.isLive ? (
                      <Badge variant="outline">
                        <span
                          aria-hidden="true"
                          className="mr-1.5 inline-block size-1.5 rounded-full bg-foreground"
                        />
                        {t("live")}
                      </Badge>
                    ) : null}
                  </div>
                  <h2 id={titleId} className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    {project.name}
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-muted">
                    {t(`items.${project.key}.text`)}
                  </p>
                </div>

                {project.url ? (
                  <p className="lg:col-span-4 lg:justify-self-end">
                    <ExternalLink
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      prefetch={false}
                      className="group inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                    >
                      {t("visitSite", { domain: project.domain })}
                      <ArrowUpRight
                        aria-hidden="true"
                        strokeWidth={1.5}
                        className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                      />
                      <span className="sr-only">{t("newTab")}</span>
                    </ExternalLink>
                  </p>
                ) : null}
              </div>

              <div className="mt-10 overflow-hidden rounded-lg border border-border bg-surface">
                {image ? (
                  <Image
                    src={image}
                    alt={t(`items.${project.key}.imageAlt`)}
                    placeholder="blur"
                    sizes="(min-width: 1280px) 1200px, 100vw"
                    className="h-auto w-full"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center">
                    <Placeholder>{tPage("toComplete")}</Placeholder>
                  </div>
                )}
              </div>

              <dl className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
                <Fact label={tPage("contextLabel")}>{t(`items.${project.key}.context`)}</Fact>
                <Fact label={tPage("resultLabel")}>{t(`items.${project.key}.result`)}</Fact>
                <Fact label={tPage("featuresLabel")}>
                  {features ? (
                    <ul className="space-y-2">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="size-1 shrink-0 rounded-full bg-foreground"
                          />
                          {t(`items.${project.key}.features.${feature}` as ProjectsMessageKey)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Placeholder>{tPage("toComplete")}</Placeholder>
                  )}
                </Fact>
                <Fact label={tPage("technologiesLabel")}>
                  {technologies ? (
                    <ul className="flex flex-wrap gap-2">
                      {technologies.map((technology) => (
                        <li key={technology}>
                          <Badge variant="outline">{technology}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Placeholder>{tPage("toComplete")}</Placeholder>
                  )}
                </Fact>
              </dl>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
