import Image from "next/image";
import ExternalLink from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FOUNDER } from "@/content/founder";

const TITLE_ID = "founder-title";

/** Section « Le fondateur » de la page À propos. */
export async function Founder() {
  const t = await getTranslations("AboutPage.founder");

  return (
    <section aria-labelledby={TITLE_ID} className="border-t border-border py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <Image
              src={FOUNDER.photo}
              alt={t("photoAlt")}
              placeholder="blur"
              sizes="(min-width: 1024px) 480px, 384px"
              className="aspect-[4/5] h-auto w-full object-cover grayscale"
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <SectionHeading id={TITLE_ID} eyebrow={t("eyebrow")} title={FOUNDER.name} />
          <p className="mt-3 font-medium text-muted">{t("role")}</p>

          <div className="mt-8 max-w-2xl space-y-5 leading-relaxed text-pretty text-muted">
            <p>{t("bio1")}</p>
            <p>{t("bio2")}</p>
            <p>{t("bio3")}</p>
          </div>

          <p className="mt-10">
            <ExternalLink
              href={FOUNDER.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className="group inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              {t("linkedin")}
              <ArrowUpRight
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
              <span className="sr-only">{t("newTab")}</span>
            </ExternalLink>
          </p>
        </div>
      </Container>
    </section>
  );
}
