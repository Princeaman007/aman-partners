import Image from "next/image";
import ExternalLink from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FEATURED_PROJECTS } from "@/content/projects";

const TITLE_ID = "projects-title";

export async function Projects() {
  const t = await getTranslations("Projects");

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
          <ArrowLink href="/realisations">{t("viewAll")}</ArrowLink>
        </div>

        <ul className="mt-12 space-y-8 lg:mt-16">
          {FEATURED_PROJECTS.map((project) => (
            <li key={project.key}>
              <article className="grid overflow-hidden rounded-lg border border-border bg-surface lg:grid-cols-12">
                <div className="border-b border-border lg:col-span-7 lg:border-r lg:border-b-0">
                  <Image
                    src={project.image}
                    alt={t(`items.${project.key}.imageAlt`)}
                    placeholder="blur"
                    sizes="(min-width: 1280px) 700px, (min-width: 1024px) 58vw, 100vw"
                    className="h-full w-full object-cover object-top"
                  />
                </div>

                <div className="flex flex-col p-6 sm:p-8 lg:col-span-5 lg:p-10">
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

                  <h3 className="mt-4 text-2xl font-bold tracking-tight">{project.name}</h3>
                  <p className="mt-3 leading-relaxed text-muted">
                    {t(`items.${project.key}.text`)}
                  </p>

                  <p className="mt-8 text-sm font-semibold">{t("featuresLabel")}</p>
                  <ul className="mt-3 space-y-2">
                    {project.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-muted">
                        <span
                          aria-hidden="true"
                          className="size-1 shrink-0 rounded-full bg-foreground"
                        />
                        {t(`items.${project.key}.features.${feature}`)}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-8 pt-2 lg:mt-auto">
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
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
