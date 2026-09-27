// Calcule l'empreinte Argon2id du mot de passe du dashboard.
// Le mot de passe n'est enregistré nulle part : seule son empreinte est affichée.
// Utilisation : node scripts/hash-admin-password.mjs

import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { hash } from "@node-rs/argon2";

const MIN_LENGTH = 12;

const readline = createInterface({ input, output });
const password = await readline.question(
  `Mot de passe du dashboard (${MIN_LENGTH} caractères minimum) : `,
);
readline.close();

if (password.length < MIN_LENGTH) {
  console.error(`\nMot de passe trop court : ${MIN_LENGTH} caractères minimum.`);
  process.exit(1);
}

// Réglages recommandés par l'OWASP pour Argon2id : 19 Mio de mémoire, 2 itérations.
const passwordHash = await hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });

// Encodé en base64 : l'empreinte contient des « $ », que les fichiers .env interprètent.
const encoded = Buffer.from(passwordHash).toString("base64");

// Affichage du résultat dans le terminal (outil en ligne de commande).
output.write("\nAjoutez cette ligne dans .env.local :\n\n");
output.write(`ADMIN_PASSWORD_HASH="${encoded}"\n`);
