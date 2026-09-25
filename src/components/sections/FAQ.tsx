import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";

const TITLE_ID = "faq-title";

/** Questions affichées, dans l'ordre (textes dans « FAQ.items »). Provisoire : remplacé à l'étape 4.1 par src/content/faq.ts. */
const QUESTIONS = ["cost", "inHouse", "ownSpecs", "manager", "maintenance"] as const;

export async function FAQ() {
  const t = await getTranslations("FAQ");

  return (
    <section aria-labelledby={TITLE_ID} className="border-t border-border py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <SectionHeading
          id={TITLE_ID}
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t.rich("description", {
            link: (chunks) => (
              <Link
                href="/contact"
                className="rounded-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                {chunks}
              </Link>
            ),
          })}
          className="lg:col-span-4"
        />

        <div className="divide-y divide-border border-y border-border lg:col-span-8">
          {QUESTIONS.map((key) => (
            <details key={key} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-6 text-left font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
                {t(`items.${key}.question`)}
                <Plus
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                />
              </summary>
              <p className="max-w-2xl pr-11 pb-6 leading-relaxed text-muted">
                {t(`items.${key}.answer`)}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
