"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { isRequestStatus } from "@/lib/admin/request-filters";
import { getRequestById, isRequestId } from "@/lib/admin/requests";
import { getDb } from "@/lib/db/client";
import { STATUSES_BY_TYPE, requestNotes, requests } from "@/lib/db/schema";

/** Longueur maximale d'une note interne. */
const MAX_NOTE_LENGTH = 2000;

/** Résultat d'une action de la fiche (null tant qu'aucune action n'a eu lieu). */
export type DetailActionState = {
  outcome: "success" | "error";
  message:
    "statusSaved" | "noteAdded" | "invalid" | "notFound" | "server" | "emptyNote" | "noteTooLong";
} | null;

/** Met à jour les pages qui affichent la demande (fiche, liste et vue d'ensemble). */
function refreshPages(requestId: string) {
  revalidatePath(`/admin/demandes/${requestId}`);
  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
}

/** Change le statut d'une demande, parmi les statuts prévus pour son type. */
export async function updateStatusAction(
  _previous: DetailActionState,
  formData: FormData,
): Promise<DetailActionState> {
  await requireAdmin();

  const requestId = formData.get("requestId");
  const status = formData.get("status");

  if (!isRequestId(requestId) || !isRequestStatus(status)) {
    return { outcome: "error", message: "invalid" };
  }

  try {
    const record = await getRequestById(requestId);
    if (!record) {
      return { outcome: "error", message: "notFound" };
    }
    if (!STATUSES_BY_TYPE[record.type].includes(status)) {
      return { outcome: "error", message: "invalid" };
    }

    await getDb().update(requests).set({ status }).where(eq(requests.id, requestId));
  } catch (error) {
    console.error("[admin] Changement de statut impossible :", error);
    return { outcome: "error", message: "server" };
  }

  refreshPages(requestId);
  return { outcome: "success", message: "statusSaved" };
}

/** Ajoute une note interne à une demande. */
export async function addNoteAction(
  _previous: DetailActionState,
  formData: FormData,
): Promise<DetailActionState> {
  await requireAdmin();

  const requestId = formData.get("requestId");
  const rawBody = formData.get("body");

  if (!isRequestId(requestId) || typeof rawBody !== "string") {
    return { outcome: "error", message: "invalid" };
  }

  const body = rawBody.trim();
  if (body === "") {
    return { outcome: "error", message: "emptyNote" };
  }
  if (body.length > MAX_NOTE_LENGTH) {
    return { outcome: "error", message: "noteTooLong" };
  }

  try {
    const record = await getRequestById(requestId);
    if (!record) {
      return { outcome: "error", message: "notFound" };
    }

    await getDb().insert(requestNotes).values({ requestId, body });
  } catch (error) {
    console.error("[admin] Ajout de note impossible :", error);
    return { outcome: "error", message: "server" };
  }

  refreshPages(requestId);
  return { outcome: "success", message: "noteAdded" };
}
