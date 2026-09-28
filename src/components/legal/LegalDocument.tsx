import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Container";
import type { LegalBlock, LegalSection } from "@/lib/legal/document";

const TOP_ID = "legal-top";

const LINK_CLASSES =
  "rounded-sm underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/** Affiche un bloc de contenu : paragraphe, liste à puces ou tableau. */
function Block({ block }: { block: LegalBlock }) {
  if (block.type === "p") {
    return <p className="leading-relaxed text-muted">{block.text}</p>;
  }

  if (block.type === "list") {
    return (
      <ul className="space-y-2">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 leading-relaxed text-muted">
            <span
              aria-hidden="true"
              className="mt-2.5 size-1.5 shrink-0 rounded-full bg-foreground"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="bg-surface">
          <tr>
            {block.headers.map((header) => (
              <th key={header} scope="col" className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.join("|")} className="border-t border-border align-top">
              {row.map((cell, cellIndex) => (
                <td key={`${cellIndex}-${cell}`} className="px-4 py-3 leading-relaxed text-muted">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: LegalSection[];
  /** Contenu ajouté après les sections (par exemple, le bouton de gestion des cookies). */
  children?: ReactNode;
};

/** Mise en page commune des pages légales : avertissement, sommaire et sections numérotées. */
export async function LegalDocument({
  eyebrow,
  title,
  description,
  sections,
  children,
}: LegalDocumentProps) {
  const t = await getTranslations("Legal.common");

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div id={TOP_ID} className="scroll-mt-28 border-t border-border py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl space-y-12">
            {/* Avertissement : texte à faire valider par un professionnel */}
            <div className="space-y-4">
              <p
                role="note"
                className="flex gap-3 rounded-lg border border-foreground bg-surface p-4 text-sm leading-relaxed"
              >
                <TriangleAlert
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="mt-0.5 size-5 shrink-0"
                />
                <span>{t("toValidate")}</span>
              </p>
              <p className="text-sm text-muted">{t("lastUpdated", { date: t("updatedDate") })}</p>
            </div>

            {/* Sommaire */}
            <nav aria-labelledby="legal-toc-title" className="rounded-lg border border-border p-6">
              <h2 id="legal-toc-title" className="text-sm font-semibold tracking-tight">
                {t("tocLabel")}
              </h2>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
                {sections.map((section) => (
                  <li key={section.id} className="pl-1">
                    <a href={`#${section.id}`} className={LINK_CLASSES}>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Sections */}
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-28 space-y-4"
              >
                <h2 id={`${section.id}-title`} className="text-xl font-semibold tracking-tight">
                  {index + 1}. {section.title}
                </h2>
                {section.blocks.map((block, blockIndex) => (
                  <Block key={`${section.id}-${blockIndex}`} block={block} />
                ))}
              </section>
            ))}

            {children}

            <p className="border-t border-border pt-8 text-sm">
              <a href={`#${TOP_ID}`} className={LINK_CLASSES}>
                {t("backToTop")}
              </a>
            </p>
          </div>
        </Container>
      </div>
    </>
  );
}
