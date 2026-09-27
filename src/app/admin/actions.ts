"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  endAdminSession,
  startAdminSession,
  verifyCredentials,
} from "@/lib/admin/auth";
import { getClientIp } from "@/lib/services/client-ip";
import { checkRateLimit } from "@/lib/services/rate-limit";

/** Résultat d'une tentative de connexion échouée (null tant qu'aucune tentative n'a eu lieu). */
export type LoginState = {
  error: "invalidCredentials" | "rateLimited" | "serverError";
  /** Minutes à attendre, en cas de trop nombreuses tentatives. */
  minutes?: number;
  /** E-mail saisi, pour ne pas avoir à le retaper après une erreur. */
  email?: string;
} | null;

/** Longueurs maximales acceptées, pour refuser d'emblée les envois démesurés. */
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 256;

/** Connexion au dashboard. */
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email === "" ||
    password === "" ||
    email.length > MAX_EMAIL_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return { error: "invalidCredentials" };
  }

  try {
    const ip = getClientIp(await headers());

    const rateLimit = await checkRateLimit("adminLogin", ip);
    if (!rateLimit.allowed) {
      return {
        error: "rateLimited",
        minutes: Math.ceil(rateLimit.retryAfterSeconds / 60),
        email,
      };
    }

    if (!(await verifyCredentials(email, password))) {
      return { error: "invalidCredentials", email };
    }

    await startAdminSession();
  } catch (error) {
    console.error("[admin] Connexion impossible :", error);
    return { error: "serverError", email };
  }

  // Hors du bloc try : redirect() fonctionne en levant une exception interne à Next.js.
  redirect(ADMIN_HOME_PATH);
}

/** Déconnexion du dashboard. */
export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect(ADMIN_LOGIN_PATH);
}
