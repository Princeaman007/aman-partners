import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin/session";

/** Routage des langues du site public (fr par défaut, en sous /en). */
const handleI18nRouting = createMiddleware(routing);

const ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN_PATH = "/admin/connexion";

function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

/**
 * Protection du dashboard : sans session valide, renvoi vers la connexion ;
 * connecté, la page de connexion renvoie vers l'accueil du dashboard.
 * Chaque page du dashboard est exclue des moteurs de recherche et des caches.
 */
async function protectAdmin(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = await isValidSessionToken(token);

  let response: NextResponse;
  if (!isAuthenticated && !isLoginPage) {
    response = NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  } else if (isAuthenticated && isLoginPage) {
    response = NextResponse.redirect(new URL(ADMIN_PREFIX, request.url));
  } else {
    response = NextResponse.next();
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export default async function proxy(request: NextRequest) {
  if (isAdminPath(request.nextUrl.pathname)) {
    return protectAdmin(request);
  }
  return handleI18nRouting(request);
}

export const config = {
  // Toutes les adresses, sauf l'API, les fichiers internes de Next.js, l'icône Apple
  // et les fichiers avec une extension (images, favicon, robots.txt…).
  matcher: ["/((?!api|_next|_vercel|apple-icon|.*\\..*).*)"],
};
