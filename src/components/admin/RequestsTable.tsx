import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatDateTime, toIsoString } from "@/lib/admin/format";
import { ADMIN_REQUESTS_PATH } from "@/lib/admin/request-filters";
import type { RequestListItem } from "@/lib/admin/requests";
import { StatusBadge } from "./StatusBadge";

type RequestsTableProps = {
  items: RequestListItem[];
};

const HEADER_CLASSES = "px-4 py-3 text-xs font-medium tracking-wide text-muted uppercase";

/** Tableau des demandes : demandeur, type, statut et date de réception. */
export function RequestsTable({ items }: RequestsTableProps) {
  const t = useTranslations("Admin");

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr>
            <th scope="col" className={HEADER_CLASSES}>
              {t("requests.columns.requester")}
            </th>
            <th scope="col" className={HEADER_CLASSES}>
              {t("requests.columns.type")}
            </th>
            <th scope="col" className={HEADER_CLASSES}>
              {t("requests.columns.status")}
            </th>
            <th scope="col" className={`${HEADER_CLASSES} text-right`}>
              {t("requests.columns.receivedAt")}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-t border-border transition-colors duration-150 hover:bg-surface"
            >
              <td className="px-4 py-3">
                <Link
                  href={`${ADMIN_REQUESTS_PATH}/${item.id}`}
                  className="rounded-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-muted">
                  {item.company ? `${item.company} · ${item.email}` : item.email}
                </p>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{t(`types.${item.type}`)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap text-muted tabular-nums">
                <time dateTime={toIsoString(item.createdAt)}>{formatDateTime(item.createdAt)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
