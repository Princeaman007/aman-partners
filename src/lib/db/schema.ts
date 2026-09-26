import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { INITIAL_STATUS, type TrackingData } from "@/lib/validation/shared";

/** Types de demandes reçues par le site. */
export const REQUEST_TYPES = ["contact", "project", "partner"] as const;

/** Statuts de suivi d'une demande dans le dashboard. */
export const REQUEST_STATUSES = [
  "new",
  "in_progress",
  "quote_sent",
  "won",
  "lost",
  "accepted",
  "declined",
  "archived",
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const requestTypeEnum = pgEnum("request_type", REQUEST_TYPES);
export const requestStatusEnum = pgEnum("request_status", REQUEST_STATUSES);

/** Pièce jointe enregistrée sur le stockage (Cloudflare R2). */
export type StoredAttachment = {
  /** Emplacement du fichier dans le stockage. */
  key: string;
  /** Nom d'origine du fichier, tel que le visiteur l'a envoyé. */
  name: string;
  size: number;
  mimeType: string;
};

/** Toutes les demandes reçues par les formulaires du site. */
export const requests = pgTable(
  "requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: requestTypeEnum("type").notNull(),
    status: requestStatusEnum("status").notNull().default(INITIAL_STATUS),
    /** Nom complet du demandeur (prénom et nom pour une demande de projet). */
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    phone: text("phone"),
    country: text("country"),
    /** Langue du site au moment de l'envoi (fr ou en), pour répondre dans la bonne langue. */
    locale: text("locale").notNull(),
    /** Champs propres au formulaire (type de projet, budget, spécialités…). */
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    attachment: jsonb("attachment").$type<StoredAttachment>(),
    tracking: jsonb("tracking").$type<NonNullable<TrackingData>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("requests_type_idx").on(table.type),
    index("requests_status_idx").on(table.status),
    index("requests_created_at_idx").on(table.createdAt),
  ],
);

/** Compteurs de la limitation des envois : une ligne par visiteur et par formulaire. */
export const rateLimits = pgTable("rate_limits", {
  /** Formulaire et empreinte irréversible de l'adresse IP, jamais l'adresse elle-même. */
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});

/** Une demande telle qu'elle est lue dans la base. */
export type RequestRecord = typeof requests.$inferSelect;

/** Une demande telle qu'on l'enregistre. */
export type NewRequestRecord = typeof requests.$inferInsert;
