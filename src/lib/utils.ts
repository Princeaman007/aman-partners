import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combine des classes CSS en résolvant les conflits Tailwind (la dernière l'emporte). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
