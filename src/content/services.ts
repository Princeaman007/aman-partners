import {
  Globe,
  LayoutDashboard,
  Smartphone,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Un service proposé. Ses textes sont dans les traductions, bloc « Services.items.<key> ». */
export type Service = {
  key: string;
  icon: LucideIcon;
  /** Ce que couvre le service, textes dans « Services.items.<key>.offerings ». */
  offerings: readonly string[];
};

/** Les cinq services, dans l'ordre du cahier des charges. */
export const SERVICES = [
  {
    key: "web",
    icon: Globe,
    offerings: ["showcase", "ecommerce", "webApps", "portals"],
  },
  {
    key: "mobile",
    icon: Smartphone,
    offerings: ["android", "ios", "reactNative", "business"],
  },
  {
    key: "software",
    icon: LayoutDashboard,
    offerings: ["business", "saas", "erp", "crm", "dashboards"],
  },
  {
    key: "automation",
    icon: Workflow,
    offerings: ["processes", "api", "integrations", "ai", "workflows"],
  },
  {
    key: "maintenance",
    icon: Wrench,
    offerings: ["fixes", "improvements", "security", "support"],
  },
] as const satisfies ReadonlyArray<Service>;

export type ServiceKey = (typeof SERVICES)[number]["key"];
