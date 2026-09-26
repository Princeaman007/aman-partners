import type { StaticImageData } from "next/image";
import shopeasyScreenshot from "@/assets/projects/shopeasy-ci.png";

/**
 * Un projet réalisé par le fondateur. Ses textes sont dans les traductions, bloc « Projects.items.<key> ».
 * Toute information manquante vaut null : elle est à compléter par Prince, rien ne doit être inventé.
 */
export type Project = {
  key: string;
  /** Nom propre du projet, identique dans toutes les langues. */
  name: string;
  /** Vrai projet réalisé par le fondateur. Seuls les projets à true peuvent être affichés. */
  isReal: boolean;
  /** Affiché sur le site. Un projet non publié reste en réserve, en attendant ses informations. */
  isPublished: boolean;
  /** Mis en avant sur la page d'accueil (doit aussi être publié). */
  isFeatured: boolean;
  /** En production et accessible au public. */
  isLive: boolean;
  /** Adresse publique du projet, uniquement s'il est en ligne. */
  url: string | null;
  /** Domaine affiché dans le lien (« Visiter shopeasyci.store »). */
  domain: string | null;
  /** Capture d'écran réelle. null : [CAPTURE À FOURNIR]. */
  image: StaticImageData | null;
  /** Technologies utilisées. null : [À COMPLÉTER PAR PRINCE]. */
  technologies: readonly string[] | null;
  /** Clés des fonctionnalités, textes dans « Projects.items.<key>.features ». null : [À COMPLÉTER PAR PRINCE]. */
  features: readonly string[] | null;
};

/** Les vrais projets du fondateur, dans l'ordre d'affichage. */
export const PROJECTS = [
  {
    key: "shopeasy",
    name: "ShopEasy CI",
    isReal: true,
    isPublished: true,
    isFeatured: true,
    isLive: true,
    url: "https://shopeasyci.store",
    domain: "shopeasyci.store",
    image: shopeasyScreenshot,
    technologies: null, // [À COMPLÉTER PAR PRINCE]
    features: ["subscriptions", "themes", "assistant", "dashboard"],
  },
  {
    key: "swiftride",
    name: "SwiftRide",
    isReal: true,
    isPublished: false,
    isFeatured: false,
    isLive: false,
    url: null,
    domain: null,
    image: null, // [CAPTURE À FOURNIR]
    technologies: ["Next.js", "Express", "MongoDB", "Cloudinary"],
    features: null, // [À COMPLÉTER PAR PRINCE]
  },
  {
    key: "edvance",
    name: "Edvance",
    isReal: true,
    isPublished: false,
    isFeatured: false,
    isLive: false,
    url: null,
    domain: null,
    image: null, // [CAPTURE À FOURNIR]
    technologies: [
      "Next.js",
      "React Native (Expo)",
      "ASP.NET Core",
      "PostgreSQL",
      "Entity Framework Core",
      "Redis",
      "SignalR",
      "Stripe",
      "CinetPay",
    ],
    features: null, // [À COMPLÉTER PAR PRINCE]
  },
  {
    key: "talentproof",
    name: "TalentProof",
    isReal: true,
    isPublished: false,
    isFeatured: false,
    isLive: false,
    url: null,
    domain: null,
    image: null, // [CAPTURE À FOURNIR]
    technologies: ["MongoDB", "Express", "React", "Node.js", "Redis"],
    features: null, // [À COMPLÉTER PAR PRINCE]
  },
  {
    key: "epb",
    name: "EPB",
    isReal: true,
    isPublished: false,
    isFeatured: false,
    isLive: false,
    url: null,
    domain: null,
    image: null, // [CAPTURE À FOURNIR]
    technologies: null, // [À COMPLÉTER PAR PRINCE]
    features: null, // [À COMPLÉTER PAR PRINCE]
  },
] as const satisfies ReadonlyArray<Project>;

type ProjectEntry = (typeof PROJECTS)[number];

export type ProjectKey = ProjectEntry["key"];

/** Un projet affichable sur la page Réalisations : réel et publié. */
export type PublishedProject = Extract<ProjectEntry, { isReal: true; isPublished: true }>;

/** Un projet affichable sur l'accueil : réel, publié et mis en avant. */
export type FeaturedProject = Extract<PublishedProject, { isFeatured: true }>;

/** Les projets de la page Réalisations. */
export const PUBLISHED_PROJECTS = PROJECTS.filter(
  (project): project is PublishedProject => project.isReal && project.isPublished,
);

/** Les projets mis en avant sur la page d'accueil. */
export const FEATURED_PROJECTS = PUBLISHED_PROJECTS.filter(
  (project): project is FeaturedProject => project.isFeatured,
);
