import { SignJWT, jwtVerify } from "jose";

/** Nom du cookie de session du dashboard. */
export const ADMIN_SESSION_COOKIE = "ap_admin_session";

/** Durée d'une session : 8 heures, en secondes. */
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

const ISSUER = "aman-partners";
const AUDIENCE = "aman-partners-admin";

/** Clé de signature des sessions, lue dans ADMIN_SESSION_SECRET. */
function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET est manquante ou trop courte (32 caractères minimum) dans .env.local.",
    );
  }

  return new TextEncoder().encode(secret);
}

/** Crée un jeton de session signé, valable ADMIN_SESSION_MAX_AGE secondes. */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

/**
 * Vérifie un jeton de session : signature, émetteur, destinataire et date d'expiration.
 * Un jeton absent, modifié, expiré ou signé avec une autre clé est refusé.
 */
export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  const key = getSecretKey();

  try {
    await jwtVerify(token, key, { algorithms: ["HS256"], issuer: ISSUER, audience: AUDIENCE });
    return true;
  } catch {
    return false;
  }
}
