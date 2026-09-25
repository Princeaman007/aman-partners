"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
  type ReactNode,
} from "react";
import { FileText, Upload, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { FieldError } from "./FormField";

type FileUploadProps = Omit<ComponentProps<"input">, "type" | "multiple"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

function formatSize(bytes: number, locale: string) {
  const isLarge = bytes >= 1_000_000;
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: isLarge ? "megabyte" : "kilobyte",
    unitDisplay: "short",
    maximumFractionDigits: 1,
  }).format(isLarge ? bytes / 1_000_000 : bytes / 1_000);
}

export function FileUpload({
  id,
  label,
  hint,
  error,
  required,
  className,
  onChange,
  ref,
  ...props
}: FileUploadProps) {
  const t = useTranslations("FileUpload");
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const labelId = `${id}-label`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const fileId = `${id}-file`;
  const describedBy = [hintId, errorId, file ? fileId : undefined].filter(Boolean).join(" ");

  function setRefs(node: HTMLInputElement | null) {
    inputRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }

  function notifyChange(input: HTMLInputElement) {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    onChange?.(event);
  }

  function handleRemove() {
    const input = inputRef.current;
    if (!input) return;
    input.value = "";
    notifyChange(input);
    input.focus();
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const input = inputRef.current;
    const dropped = event.dataTransfer.files[0];
    if (!input || !dropped) return;
    const transfer = new DataTransfer();
    transfer.items.add(dropped);
    input.files = transfer.files;
    notifyChange(input);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <span id={labelId} className="block text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5">
            *
          </span>
        ) : null}
      </span>

      <input
        ref={setRefs}
        id={id}
        type="file"
        required={required}
        aria-labelledby={labelId}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : undefined}
        className="peer sr-only"
        onChange={handleChange}
        {...props}
      />

      <label
        htmlFor={id}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border-strong bg-background px-4 py-4",
          "text-sm text-foreground transition-colors duration-150 hover:border-foreground",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground",
          "peer-aria-invalid:border-solid peer-aria-invalid:border-foreground peer-aria-invalid:ring-1 peer-aria-invalid:ring-foreground",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          isDragging && "border-foreground bg-foreground/5",
        )}
      >
        <Upload aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0" />
        <span className="font-medium">{file ? t("change") : t("choose")}</span>
        <span className="hidden text-muted sm:inline">{t("orDrop")}</span>
      </label>

      <div aria-live="polite">
        {file ? (
          <div
            id={fileId}
            className="flex items-center justify-between gap-3 rounded-md bg-foreground/5 px-3 py-2 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <FileText aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0" />
              <span className="sr-only">{t("selected")}</span>
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-muted">{formatSize(file.size, locale)}</span>
            </span>
            <button
              type="button"
              onClick={handleRemove}
              aria-label={t("remove")}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <X aria-hidden="true" strokeWidth={2} className="size-4" />
            </button>
          </div>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
