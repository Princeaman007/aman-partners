import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Contenu facultatif sous le texte, par exemple des boutons. */
  children?: ReactNode;
};

/** En-tête des pages intérieures : intitulé, titre principal (h1) et introduction. */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="pt-16 pb-16 sm:pt-24 sm:pb-20">
      <Container>
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} />
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </header>
  );
}
