import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL est manquante : ajoutez-la dans le fichier .env.local.");
  }

  return drizzle({ client: neon(databaseUrl), schema });
}

type Database = ReturnType<typeof createDatabase>;

let database: Database | undefined;

/**
 * Accès à la base de données, côté serveur uniquement.
 * La connexion est créée au premier appel, puis réutilisée.
 */
export function getDb(): Database {
  database ??= createDatabase();
  return database;
}
