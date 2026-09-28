"use client";

import { useActionState } from "react";
import { Check, CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  addNoteAction,
  updateStatusAction,
  type DetailActionState,
} from "@/app/admin/(dashboard)/demandes/actions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { RequestStatus } from "@/lib/db/schema";

const LABEL_CLASSES = "block text-sm font-medium text-foreground";

/** Confirmation ou erreur d'une action, annoncée aux lecteurs d'écran. */
function ActionMessage({ state }: { state: DetailActionState }) {
  const t = useTranslations("Admin.detail");

  if (!state) {
    return null;
  }

  const isSuccess = state.outcome === "success";
  let text: string;
  if (state.message === "statusSaved" || state.message === "noteAdded") {
    text = t(state.message);
  } else {
    text = t(`errors.${state.message}`);
  }

  return (
    <p role="status" className="flex items-start gap-2 text-sm font-medium">
      {isSuccess ? (
        <Check aria-hidden="true" strokeWidth={2} className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CircleAlert aria-hidden="true" strokeWidth={2} className="mt-0.5 size-4 shrink-0" />
      )}
      {text}
    </p>
  );
}

type StatusFormProps = {
  requestId: string;
  currentStatus: RequestStatus;
  /** Statuts proposés pour le type de la demande. */
  options: readonly RequestStatus[];
};

/** Changement de statut d'une demande. */
export function StatusForm({ requestId, currentStatus, options }: StatusFormProps) {
  const t = useTranslations("Admin");
  const [state, formAction, isPending] = useActionState<DetailActionState, FormData>(
    updateStatusAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <label htmlFor="detail-status" className={LABEL_CLASSES}>
        {t("detail.statusLabel")}
      </label>
      <Select id="detail-status" name="status" defaultValue={currentStatus}>
        {options.map((status) => (
          <option key={status} value={status}>
            {t(`statuses.${status}`)}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="secondary" size="sm" disabled={isPending} className="w-full">
        {isPending ? t("detail.saving") : t("detail.saveStatus")}
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}

type NoteFormProps = {
  requestId: string;
};

/** Ajout d'une note interne. */
export function NoteForm({ requestId }: NoteFormProps) {
  const t = useTranslations("Admin.detail");
  const [state, formAction, isPending] = useActionState<DetailActionState, FormData>(
    addNoteAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <label htmlFor="detail-note" className={LABEL_CLASSES}>
        {t("noteLabel")}
      </label>
      <Textarea
        id="detail-note"
        name="body"
        rows={4}
        maxLength={2000}
        required
        placeholder={t("notePlaceholder")}
      />
      <Button type="submit" variant="secondary" size="sm" disabled={isPending} className="w-full">
        {isPending ? t("saving") : t("addNote")}
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}
