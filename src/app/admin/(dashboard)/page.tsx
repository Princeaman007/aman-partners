import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RequestsTable } from "@/components/admin/RequestsTable";
import { ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { buildRequestsHref } from "@/lib/admin/request-filters";
import { getRequestCounters, listLatestRequests } from "@/lib/admin/requests";
import { REQUEST_TYPES } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const LINK_CLASSES =
  "group inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground";

type CounterCardProps = {
  label: string;
  value: number;
  href: string;
  hint?: string;
  highlighted?: boolean;
};

/** Carte de chiffre clé, qui mène à la liste filtrée correspondante. */
function CounterCard({ label, value, href, hint, highlighted = false }: CounterCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col rounded-lg border p-5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        highlighted
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background hover:border-foreground",
      )}
    >
      <span className={cn("text-sm font-medium", highlighted ? "opacity-80" : "text-muted")}>
        {label}
      </span>
      <span className="mt-3 text-4xl font-bold tracking-tight tabular-nums">{value}</span>
      {hint ? (
        <span className={cn("mt-1 text-xs", highlighted ? "opacity-80" : "text-muted")}>
          {hint}
        </span>
      ) : null}
    </Link>
  );
}

/** Vue d'ensemble : chiffres clés, répartition par type et dernières demandes. */
export default async function AdminHomePage() {
  // Seconde barrière, derrière le proxy : aucune donnée n'est lue sans session valide.
  await requireAdmin();

  const t = await getTranslations({ locale: "fr", namespace: "Admin" });
  const [counters, latest] = await Promise.all([getRequestCounters(), listLatestRequests(5)]);

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t("home.title")}</h1>
        <p className="mt-2 text-muted">{t("home.description")}</p>
      </header>

      {/* Chiffres clés */}
      <section aria-labelledby="home-counters-title">
        <h2 id="home-counters-title" className="sr-only">
          {t("home.countersLabel")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CounterCard
            label={t("home.newRequests")}
            value={counters.byStatus.new}
            hint={t("home.newRequestsHint")}
            href={buildRequestsHref({ status: "new" })}
            highlighted
          />
          <CounterCard
            label={t("home.inProgress")}
            value={counters.byStatus.in_progress}
            href={buildRequestsHref({ status: "in_progress" })}
          />
          <CounterCard
            label={t("home.quotesSent")}
            value={counters.byStatus.quote_sent}
            href={buildRequestsHref({ status: "quote_sent" })}
          />
          <CounterCard
            label={t("home.total")}
            value={counters.totalActive}
            href={buildRequestsHref({})}
          />
        </div>
      </section>

      {/* Répartition par type */}
      <section aria-labelledby="home-types-title">
        <h2 id="home-types-title" className="text-lg font-semibold tracking-tight">
          {t("home.byType")}
        </h2>
        <ul className="mt-4 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {REQUEST_TYPES.map((type) => (
            <li key={type} className="bg-background">
              <Link
                href={buildRequestsHref({ type })}
                className="flex items-baseline justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground"
              >
                <span className="text-sm font-medium">{t(`types.${type}`)}</span>
                <span className="text-2xl font-bold tabular-nums">{counters.byType[type]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Dernières demandes */}
      <section aria-labelledby="home-latest-title" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 id="home-latest-title" className="text-lg font-semibold tracking-tight">
            {t("home.latest")}
          </h2>
          {latest.length > 0 ? (
            <Link href={buildRequestsHref({})} className={LINK_CLASSES}>
              {t("home.viewAll")}
              <ArrowRight
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </Link>
          ) : null}
        </div>

        {latest.length > 0 ? (
          <RequestsTable items={latest} />
        ) : (
          <p className="rounded-lg border border-dashed border-border-strong bg-background px-6 py-12 text-center text-sm text-muted">
            {t("home.empty")}
          </p>
        )}
      </section>
    </div>
  );
}
