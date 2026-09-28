import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { buildRequestsHref, type RequestFilters } from "@/lib/admin/request-filters";
import { cn } from "@/lib/utils";

type PaginationProps = {
  filters: RequestFilters;
  page: number;
  pageCount: number;
};

const LINK_CLASSES =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors duration-150 hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

const DISABLED_CLASSES =
  "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted opacity-50";

/** Pagination de la liste : page précédente et suivante, en conservant les filtres. */
export function Pagination({ filters, page, pageCount }: PaginationProps) {
  const t = useTranslations("Admin.requests");

  if (pageCount <= 1) {
    return null;
  }

  const hasPrevious = page > 1;
  const hasNext = page < pageCount;

  return (
    <nav
      aria-label={t("pagination")}
      className="flex items-center justify-between gap-4 border-t border-border pt-6"
    >
      {hasPrevious ? (
        <Link href={buildRequestsHref({ ...filters, page: page - 1 })} className={LINK_CLASSES}>
          <ChevronLeft aria-hidden="true" strokeWidth={1.5} className="size-4" />
          {t("previous")}
        </Link>
      ) : (
        <span aria-hidden="true" className={DISABLED_CLASSES}>
          <ChevronLeft strokeWidth={1.5} className="size-4" />
          {t("previous")}
        </span>
      )}

      <p className="text-sm text-muted tabular-nums">{t("pageOf", { page, total: pageCount })}</p>

      {hasNext ? (
        <Link href={buildRequestsHref({ ...filters, page: page + 1 })} className={cn(LINK_CLASSES)}>
          {t("next")}
          <ChevronRight aria-hidden="true" strokeWidth={1.5} className="size-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={DISABLED_CLASSES}>
          {t("next")}
          <ChevronRight strokeWidth={1.5} className="size-4" />
        </span>
      )}
    </nav>
  );
}
