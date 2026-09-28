/** Fuseau horaire d'affichage du dashboard : celui de Bruxelles, heure d'été comprise. */
const TIME_ZONE = "Europe/Brussels";

const dateTimeFormatter = new Intl.DateTimeFormat("fr-BE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat("fr-BE", {
  dateStyle: "medium",
  timeZone: TIME_ZONE,
});

const megabyteFormatter = new Intl.NumberFormat("fr-BE", {
  style: "unit",
  unit: "megabyte",
  unitDisplay: "short",
  maximumFractionDigits: 1,
});

const kilobyteFormatter = new Intl.NumberFormat("fr-BE", {
  style: "unit",
  unit: "kilobyte",
  unitDisplay: "short",
  maximumFractionDigits: 0,
});

/** Date et heure, par exemple « 28 sept. 2026, 09:30 ». */
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

/** Date seule, par exemple « 28 sept. 2026 ». */
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/** Date au format ISO, pour l'attribut dateTime des balises <time>. */
export function toIsoString(date: Date): string {
  return date.toISOString();
}

/** Taille de fichier lisible, par exemple « 2,4 Mo » ou « 350 ko ». */
export function formatFileSize(bytes: number): string {
  return bytes >= 1_000_000
    ? megabyteFormatter.format(bytes / 1_000_000)
    : kilobyteFormatter.format(Math.max(1, bytes / 1_000));
}
