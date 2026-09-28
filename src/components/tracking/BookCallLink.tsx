"use client";

import type { ReactNode } from "react";
import { createEventId, trackConversion } from "@/lib/tracking/conversions";

type BookCallLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** Lien vers la prise de rendez-vous, qui signale la conversion « clic sur Réserver un appel ». */
export function BookCallLink({ href, className, children }: BookCallLinkProps) {
  function handleClick() {
    trackConversion("bookCallClick", createEventId());
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
