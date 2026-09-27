import { ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectRequestForm } from "@/components/forms/ProjectRequestForm";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Container";

type ProjectRequestPageProps = {
  params: Promise<{ locale: string }>;
};

/** Étapes de l'encart « Ce qui se passe ensuite » (textes dans « ProjectRequestPage.next »). */
const NEXT_STEPS = ["review", "proposal", "start"] as const;

export default async function ProjectRequestPage({ params }: ProjectRequestPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ProjectRequestPage");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <div className="border-t border-border py-16 sm:py-20">
        <Container className="grid gap-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <ProjectRequestForm />
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-8 lg:sticky lg:top-28">
              <section
                aria-labelledby="project-next-title"
                className="rounded-lg border border-border bg-surface p-6"
              >
                <h2 id="project-next-title" className="text-base font-semibold tracking-tight">
                  {t("nextTitle")}
                </h2>
                <ol className="mt-5 space-y-5">
                  {NEXT_STEPS.map((key, index) => (
                    <li key={key} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="flex size-6 shrink-0 items-center justify-center rounded-full border border-foreground text-xs font-semibold tabular-nums"
                      >
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-muted">{t(`next.${key}`)}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <p className="flex gap-3 text-sm leading-relaxed text-muted">
                <ShieldCheck
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="mt-0.5 size-5 shrink-0"
                />
                {t("privacyNote")}
              </p>
            </div>
          </aside>
        </Container>
      </div>
    </>
  );
}
