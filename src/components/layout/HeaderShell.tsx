"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Distance de défilement (en pixels) à partir de laquelle le header prend un fond. */
const SCROLL_THRESHOLD = 8;

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function getIsScrolled() {
  return window.scrollY > SCROLL_THRESHOLD;
}

function getServerIsScrolled() {
  return false;
}

type HeaderShellProps = {
  children: ReactNode;
};

export function HeaderShell({ children }: HeaderShellProps) {
  const isScrolled = useSyncExternalStore(subscribe, getIsScrolled, getServerIsScrolled);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-200",
        isScrolled ? "border-border bg-background" : "border-transparent bg-transparent",
      )}
    >
      {children}
    </header>
  );
}
