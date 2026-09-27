import "server-only";
import type { TrackingData } from "@/lib/validation/shared";

/** Origine d'une demande d'après les paramètres de campagne (source / support / campagne), ou null. */
export function describeSource(tracking: TrackingData): string | null {
  if (!tracking) {
    return null;
  }
  const parts = [tracking.utm_source, tracking.utm_medium, tracking.utm_campaign].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : null;
}
