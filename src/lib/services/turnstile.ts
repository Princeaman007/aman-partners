import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Taille maximale d'un jeton Turnstile, selon la documentation de Cloudflare. */
const MAX_TOKEN_LENGTH = 2048;

type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

/**
 * Vérifie auprès de Cloudflare le jeton Turnstile envoyé par le formulaire.
 * Renvoie true si le visiteur est validé, false dans tous les autres cas
 * (jeton absent, invalide, expiré, déjà utilisé, ou Cloudflare injoignable).
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY est manquante : ajoutez-la dans le fichier .env.local.");
  }

  if (!token || token.length > MAX_TOKEN_LENGTH) {
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as SiteverifyResponse;
    return result.success;
  } catch {
    return false;
  }
}
