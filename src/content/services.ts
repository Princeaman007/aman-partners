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
};

/** Les cinq services, dans l'ordre du cahier des charges. */
export const SERVICES = [
  { key: "web", icon: Globe },
  { key: "mobile", icon: Smartphone },
  { key: "software", icon: LayoutDashboard },
  { key: "automation", icon: Workflow },
  { key: "maintenance", icon: Wrench },
] as const satisfies ReadonlyArray<Service>;

export type ServiceKey = (typeof SERVICES)[number]["key"];
