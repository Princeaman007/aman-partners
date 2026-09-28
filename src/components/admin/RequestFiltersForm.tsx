"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ADMIN_REQUESTS_PATH, type RequestFilters } from "@/lib/admin/request-filters";
import { REQUEST_STATUSES, REQUEST_TYPES } from "@/lib/db/schema";

type RequestFiltersFormProps = {
  filters: RequestFilters;
};

const LABEL_CLASSES = "block text-sm font-medium text-foreground";

/**
 * Filtres de la liste : un formulaire GET ordinaire. Les critères s'inscrivent dans l'adresse,
 * qu'on peut garder en favori, et la page fonctionne même sans JavaScript.
 */
export function RequestFiltersForm({ filters }: RequestFiltersFormProps) {
  const t = useTranslations("Admin");

  return (
    <form
      method="get"
      action={ADMIN_REQUESTS_PATH}
      role="search"
      aria-label={t("requests.filtersLabel")}
      className="grid gap-4 rounded-lg border border-border bg-background p-4 sm:p-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end"
    >
      <div className="space-y-2">
        <label htmlFor="requests-q" className={LABEL_CLASSES}>
          {t("requests.search")}
        </label>
        <Input
          id="requests-q"
          name="q"
          type="search"
          defaultValue={filters.q ?? ""}
          placeholder={t("requests.searchPlaceholder")}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="requests-type" className={LABEL_CLASSES}>
          {t("requests.type")}
        </label>
        <Select id="requests-type" name="type" defaultValue={filters.type ?? ""}>
          <option value="">{t("requests.allTypes")}</option>
          {REQUEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`types.${type}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="requests-status" className={LABEL_CLASSES}>
          {t("requests.status")}
        </label>
        <Select id="requests-status" name="status" defaultValue={filters.status ?? ""}>
          <option value="">{t("requests.allStatuses")}</option>
          {REQUEST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`statuses.${status}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit">
          <Search aria-hidden="true" strokeWidth={1.5} className="mr-2 size-4" />
          {t("requests.apply")}
        </Button>
        <Link
          href={ADMIN_REQUESTS_PATH}
          className="rounded-sm text-sm text-muted underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-foreground hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {t("requests.reset")}
        </Link>
      </div>
    </form>
  );
}
