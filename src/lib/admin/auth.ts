import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createSessionToken,
  isValidSessionToken,
} from "./session";

/** Adresse de la page de connexion du dashboard. */
export const ADMIN_LOGIN_PATH = "/admin/connexion";

/** Adresse d'accueil du dashboard, après connexion. */
export const ADMIN_HOME_PATH = "/admin";

type AdminConfig = {
  email: string;
  passwordHash: string;
};

function readAdminConfig(): AdminConfig {
  const { ADMIN_EMAIL, ADMIN_PASSWORD_HASH } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD_HASH doivent être définies dans .env.local.");
  }

  return {
    email: ADMIN_EMAIL.trim().toLowerCase(),
    // L'empreinte est stockée en base64 : les « $ » d'une empreinte Argon2 perturbent les fichiers .env.
    passwordHash: Buffer.from(ADMIN_PASSWORD_HASH, "base64").toString("utf8"),
  };
}

/**
 * Compare deux textes en temps constant : la durée de la comparaison ne révèle pas
 * à partir de quel caractère ils diffèrent.
 */
function sameText(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

/**
 * Vérifie l'e-mail et le mot de passe. Le mot de passe est toujours vérifié, même si l'e-mail
 * est faux : la réponse prend le même temps dans les deux cas, et ne révèle pas l'adresse du compte.
 */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const config = readAdminConfig();
  const emailMatches = sameText(email.trim().toLowerCase(), config.email);

  let passwordMatches = false;
  try {
    passwordMatches = await verify(config.passwordHash, password);
  } catch {
    passwordMatches = false;
  }

  return emailMatches && passwordMatches;
}

/** Ouvre une session : dépose le cookie signé, limité au dashboard. */
export async function startAdminSession(): Promise<void> {
  const token = await createSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

/** Ferme la session : le cookie est remplacé par un cookie vide, immédiatement expiré. */
export async function endAdminSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 0,
  });
}

/** Indique si la requête en cours a une session d'administration valide. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

/**
 * À appeler en tête de chaque page et de chaque action du dashboard :
 * sans session valide, renvoie vers la page de connexion.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect(ADMIN_LOGIN_PATH);
  }
}
