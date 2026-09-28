"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FileText,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ADMIN_REQUESTS_PATH } from "@/lib/admin/request-filters";
import type { RequestType } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type NavItem = {
  key: "overview" | "requests" | "projects" | "contacts" | "partners";
  href: string;
  icon: LucideIcon;
  /** Type de demande filtré par le raccourci. */
  type?: RequestType;
};

const MAIN_ITEMS: NavItem[] = [
  { key: "overview", href: "/admin", icon: LayoutDashboard },
  { key: "requests", href: ADMIN_REQUESTS_PATH, icon: Inbox },
];

const TYPE_ITEMS: NavItem[] = [
  { key: "projects", href: `${ADMIN_REQUESTS_PATH}?type=project`, icon: FileText, type: "project" },
  {
    key: "contacts",
    href: `${ADMIN_REQUESTS_PATH}?type=contact`,
    icon: MessageSquare,
    type: "contact",
  },
  { key: "partners", href: `${ADMIN_REQUESTS_PATH}?type=partner`, icon: Users, type: "partner" },
];

/** Indique si un lien correspond à la page affichée. */
function isActive(item: NavItem, pathname: string, typeParam: string | null): boolean {
  if (item.key === "overview") {
    return pathname === "/admin";
  }
  if (!pathname.startsWith(ADMIN_REQUESTS_PATH)) {
    return false;
  }
  if (item.type) {
    return typeParam === item.type;
  }
  return typeParam === null;
}

type AdminNavProps = {
  orientation: "vertical" | "horizontal";
};

/** Navigation du dashboard : barre latérale sur ordinateur, onglets sur téléphone. */
export function AdminNav({ orientation }: AdminNavProps) {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  const typeParam = useSearchParams().get("type");

  function renderItem(item: NavItem) {
    const active = isActive(item, pathname, typeParam);
    const Icon = item.icon;

    return (
      <li key={item.key} className={orientation === "horizontal" ? "shrink-0" : undefined}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 text-sm transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
            orientation === "vertical"
              ? "rounded-md px-3 py-2"
              : "border-b-2 px-1 py-3 whitespace-nowrap",
            active ? "font-semibold text-foreground" : "text-muted hover:text-foreground",
            orientation === "vertical" && active && "bg-surface",
            orientation === "horizontal" && (active ? "border-foreground" : "border-transparent"),
          )}
        >
          <Icon aria-hidden="true" strokeWidth={1.5} className="size-4 shrink-0" />
          {t(`nav.${item.key}`)}
        </Link>
      </li>
    );
  }

  if (orientation === "horizontal") {
    return (
      <nav aria-label={t("layout.navLabel")} className="overflow-x-auto">
        <ul className="flex gap-6 px-4 sm:px-6">
          {[...MAIN_ITEMS, ...TYPE_ITEMS].map(renderItem)}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label={t("layout.navLabel")} className="space-y-6">
      <ul className="space-y-1">{MAIN_ITEMS.map(renderItem)}</ul>
      <div>
        <p className="px-3 text-xs font-medium tracking-wide text-muted uppercase">
          {t("nav.shortcuts")}
        </p>
        <ul className="mt-2 space-y-1">{TYPE_ITEMS.map(renderItem)}</ul>
      </div>
    </nav>
  );
}
