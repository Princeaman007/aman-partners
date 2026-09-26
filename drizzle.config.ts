import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit s'exécute hors de Next.js : on charge nous-mêmes les variables de .env.local.
config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL est manquante : ajoutez-la dans le fichier .env.local.");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
