import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/metadata";

/**
 * Chez Vercel, seul le site de production est indexable : les versions de prévisualisation
 * (VERCEL_ENV = "preview") sont fermées à tous les robots. Hors Vercel (en local), tout est ouvert.
 */
function isIndexable(): boolean {
  const vercelEnvironment = process.env.VERCEL_ENV;
  return vercelEnvironment ? vercelEnvironment === "production" : true;
}

/** Consignes aux robots d'exploration. */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      // L'image de partage doit rester lisible par les réseaux sociaux.
      allow: ["/", "/api/og/"],
      disallow: ["/admin", "/api/", "/styleguide", "/en/styleguide"],
    },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}
