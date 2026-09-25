import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SERVICES } from "@/content/services";

/** Détail des services : présentation et liste de ce que chacun couvre. */
export async function ServiceList() {
  const t = await getTranslations("Services");
  const tPage = await getTranslations("ServicesPage");

  type ServicesMessageKey = Parameters<typeof t>[0];

  return (
    <div className="border-t border-border">
      <Container>
        <ul className="divide-y divide-border">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            const titleId = `${service.key}-title`;

            return (
              <li key={service.key} id={service.key} className="py-16 sm:py-20">
                <article
                  aria-labelledby={titleId}
                  className="grid gap-10 lg:grid-cols-12 lg:gap-16"
                >
                  <div className="lg:col-span-5">
                    <span className="flex size-12 items-center justify-center rounded-md border border-border">
                      <Icon aria-hidden="true" strokeWidth={1.5} className="size-6" />
                    </span>
                    <h2
                      id={titleId}
                      className="mt-6 text-2xl font-bold tracking-tight text-balance sm:text-3xl"
                    >
                      {t(`items.${service.key}.title`)}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-pretty text-muted">
                      {t(`items.${service.key}.description`)}
                    </p>
                  </div>

                  <div className="lg:col-span-7 lg:pt-2">
                    <p className="text-sm font-semibold">{tPage("offeringsLabel")}</p>
                    <ul className="mt-4 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
                      {service.offerings.map((offering) => (
                        <li
                          key={offering}
                          className="flex items-center gap-3 bg-background px-5 py-4 text-sm sm:odd:last:col-span-2"
                        >
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 rounded-full bg-foreground"
                          />
                          {t(`items.${service.key}.offerings.${offering}` as ServicesMessageKey)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}
