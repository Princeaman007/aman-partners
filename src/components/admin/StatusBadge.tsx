import { Archive, Check, CircleDot, Clock, Send, X, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import type { RequestStatus } from "@/lib/db/schema";

/** Icône de chaque statut : l'information ne repose jamais sur la couleur seule. */
const STATUS_ICONS: Record<RequestStatus, LucideIcon> = {
  new: CircleDot,
  in_progress: Clock,
  quote_sent: Send,
  won: Check,
  lost: X,
  accepted: Check,
  declined: X,
  archived: Archive,
};

type StatusBadgeProps = {
  status: RequestStatus;
};

/** Statut d'une demande. « Nouvelle » est le seul en fond plein, pour ressortir dans la liste. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations("Admin.statuses");
  const Icon = STATUS_ICONS[status];

  return (
    <Badge variant={status === "new" ? "solid" : "outline"}>
      <Icon aria-hidden="true" strokeWidth={2} className="mr-1.5 inline-block size-3.5" />
      {t(status)}
    </Badge>
  );
}
