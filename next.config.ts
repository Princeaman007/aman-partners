import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Le site est servi en HTTPS (production en ligne). En local, même en mode production,
 * le site tourne en http : l'obligation du HTTPS y casserait tout.
 */
const isHttpsSite =
  !isDevelopment && (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

/** Domaines de Google : balise, Google Analytics 4 et conversions Google Ads. */
const GOOGLE_DOMAINS = [
  "https://*.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://*.g.doubleclick.net",
  "https://www.googleadservices.com",
  "https://*.google.com",
  // Domaines nationaux de Google des pays visés (conversions Google Ads).
  "https://www.google.be",
  "https://www.google.fr",
  "https://www.google.ci",
];

/** Scripts de Google : la balise, et les scripts de mesure des conversions Google Ads. */
const GOOGLE_SCRIPT_DOMAINS = [
  "https://www.googletagmanager.com",
  "https://www.googleadservices.com",
  "https://googleads.g.doubleclick.net",
  "https://www.google.com",
];

/** Domaines de Meta : script du Pixel et envoi des événements. */
const META_DOMAINS = ["https://connect.facebook.net", "https://www.facebook.com"];

/** Domaine de Cloudflare Turnstile : script et cadre du widget anti-robots. */
const TURNSTILE_DOMAINS = ["https://challenges.cloudflare.com"];

/**
 * Politique de sécurité du contenu : la liste exacte de ce que le navigateur peut charger.
 * Scripts en ligne autorisés pour les seuls scripts du site (pages pré-générées, option A).
 */
const CSP_DIRECTIVES: { [directive: string]: string[] } = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    // Uniquement en développement : le rechargement à chaud de Next.js en a besoin.
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
    ...GOOGLE_SCRIPT_DOMAINS,
    "https://connect.facebook.net",
    ...TURNSTILE_DOMAINS,
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", ...GOOGLE_DOMAINS, "https://www.facebook.com"],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    ...GOOGLE_DOMAINS,
    ...META_DOMAINS,
    ...TURNSTILE_DOMAINS,
    // Uniquement en développement : mise à jour de la page par le serveur de développement.
    ...(isDevelopment ? ["ws:", "wss:"] : []),
  ],
  "frame-src": [
    ...TURNSTILE_DOMAINS,
    "https://td.doubleclick.net",
    "https://bid.g.doubleclick.net",
    "https://www.googletagmanager.com",
  ],
  "worker-src": ["'self'", "blob:"],
  "manifest-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
};

const contentSecurityPolicy = [
  ...Object.entries(CSP_DIRECTIVES).map(
    ([directive, sources]) => `${directive} ${sources.join(" ")}`,
  ),
  // Site en ligne en HTTPS : toute ressource appelée en http est demandée en https.
  ...(isHttpsSite ? ["upgrade-insecure-requests"] : []),
].join("; ");

/** En-têtes de sécurité appliqués à toutes les réponses du site. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Doublon historique de frame-ancestors, pour les navigateurs anciens.
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), browsing-topics=()",
  },
  // HTTPS obligatoire pendant deux ans, sur le site en ligne uniquement.
  ...(isHttpsSite ? [{ key: "Strict-Transport-Security", value: "max-age=63072000" }] : []),
];

const nextConfig: NextConfig = {
  devIndicators: false,
  // Ne pas annoncer « Next.js » dans les réponses : inutile d'aider un attaquant.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
