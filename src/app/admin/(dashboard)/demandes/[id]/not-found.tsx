import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { ADMIN_REQUESTS_PATH } from "@/lib/admin/request-filters";

/** Affichée quand la demande n'existe pas ou a été supprimée. */
export default function RequestNotFound() {
  const t = useTranslations("Admin.detail");

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{t("notFoundTitle")}</h1>
      <p className="text-muted">{t("notFoundText")}</p>
      <Link
        href={ADMIN_REQUESTS_PATH}
        className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="size-4" />
        {t("back")}
      </Link>
    </div>
  );
}
