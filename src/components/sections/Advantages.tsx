import {
  Code,
  Layers,
  ListChecks,
  MessageSquare,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TITLE_ID = "advantages-title";

/** Les six avantages ; le premier est mis en valeur (textes dans « Advantages.items »). */
const ADVANTAGES = [
  { key: "founder", icon: Code },
  { key: "single", icon: MessageSquare },
  { key: "experts", icon: Users },
  { key: "business", icon: Target },
  { key: "followup", icon: ListChecks },
  { key: "scalable", icon: Layers },
] as const satisfies ReadonlyArray<{ key: string; icon: LucideIcon }>;

const HIGHLIGHTED_KEY = "founder";

export async function Advantages() {
  const t = await getTranslations("Advantages");

  return (
    <section aria-labelledby={TITLE_ID} className="border-t border-border py-20 sm:py-28">
      <Container>
        <SectionHeading
          id={TITLE_ID}
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {ADVANTAGES.map(({ key, icon: Icon }) => (
            <li key={key} className="bg-background p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <Icon aria-hidden="true" strokeWidth={1.5} className="size-6" />
                {key === HIGHLIGHTED_KEY ? <Badge variant="solid">{t("highlight")}</Badge> : null}
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`items.${key}.text`)}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
