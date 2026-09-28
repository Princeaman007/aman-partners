import { Inbox } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/admin/Pagination";
import { RequestFiltersForm } from "@/components/admin/RequestFiltersForm";
import { RequestsTable } from "@/components/admin/RequestsTable";
import { requireAdmin } from "@/lib/admin/auth";
import { parseRequestFilters, type SearchParams } from "@/lib/admin/request-filters";
import { listRequests } from "@/lib/admin/requests";

type RequestsPageProps = {
  searchParams: Promise<SearchParams>;
};

/** Liste des demandes, avec filtres, recherche et pagination. */
export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  await requireAdmin();

  const t = await getTranslations({ locale: "fr", namespace: "Admin.requests" });
  const filters = parseRequestFilters(await searchParams);
  const { items, total, page, pageCount } = await listRequests(filters);

  const hasFilters = Boolean(filters.type ?? filters.status ?? filters.q);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted">{t("description")}</p>
        </div>
        <p className="text-sm font-medium text-muted tabular-nums" aria-live="polite">
          {t("resultCount", { count: total })}
        </p>
      </header>

      <RequestFiltersForm filters={filters} />

      {items.length > 0 ? (
        <>
          <RequestsTable items={items} />
          <Pagination filters={filters} page={page} pageCount={pageCount} />
        </>
      ) : (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border-strong bg-background px-6 py-16 text-center">
          <Inbox aria-hidden="true" strokeWidth={1.5} className="size-8 text-muted" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            {hasFilters ? t("empty") : t("emptyAll")}
          </p>
        </div>
      )}
    </div>
  );
}
