import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

/** Image générée une seule fois, à la construction du site, pour chaque langue. */
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Dimensions recommandées par Facebook, LinkedIn et X. */
const OG_IMAGE_SIZE = { width: 1200, height: 630 };

const COLORS = {
  background: "#0A0A0A",
  text: "#FAFAFA",
  muted: "#A3A3A3",
};

/** Polices installées avec pnpm (Fontsource), au format WOFF accepté par le générateur d'images. */
const FONT_FILES = {
  manropeRegular: "@fontsource/manrope/files/manrope-latin-400-normal.woff",
  manropeBold: "@fontsource/manrope/files/manrope-latin-700-normal.woff",
  instrumentItalic: "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff",
};

function loadFont(path: string) {
  return readFile(join(process.cwd(), "node_modules", path));
}

/** Sépare l'accroche du hero en deux parties : le texte, puis la partie en italique (<accent>). */
function splitTitle(raw: string): { main: string; accent: string } {
  const match = /^(.*?)\s*<accent>(.*?)<\/accent>\s*$/.exec(raw);
  return match ? { main: match[1] ?? raw, accent: match[2] ?? "" } : { main: raw, accent: "" };
}

type OgImageContext = {
  params: Promise<{ locale: string }>;
};

/** Image de partage Open Graph, dans la charte monochrome. */
export async function GET(_request: Request, { params }: OgImageContext) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return new Response(null, { status: 404 });
  }

  const t = await getTranslations({ locale, namespace: "Hero" });
  const { main, accent } = splitTitle(t.raw("title") as string);

  const [manropeRegular, manropeBold, instrumentItalic] = await Promise.all([
    loadFont(FONT_FILES.manropeRegular),
    loadFont(FONT_FILES.manropeBold),
    loadFont(FONT_FILES.instrumentItalic),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: COLORS.background,
        color: COLORS.text,
        fontFamily: "Manrope",
      }}
    >
      {/* Logo : symbole Convergence et logotype */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
          <path
            d="M8 42 L24 6 L40 42"
            stroke={COLORS.text}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="30" r="4" fill={COLORS.text} />
        </svg>
        <div style={{ display: "flex", alignItems: "baseline", marginLeft: 20, fontSize: 40 }}>
          <span style={{ fontWeight: 700 }}>Aman</span>
          <span
            style={{
              fontFamily: "Instrument Serif",
              fontStyle: "italic",
              fontSize: 48,
              margin: "0 8px",
            }}
          >
            &
          </span>
          <span style={{ fontWeight: 400 }}>Partners</span>
        </div>
      </div>

      {/* Accroche */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        <span>{main}</span>
        {accent ? (
          <span style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontWeight: 400 }}>
            {accent}
          </span>
        ) : null}
      </div>

      {/* Activité */}
      <div style={{ display: "flex", fontSize: 28, color: COLORS.muted }}>{t("eyebrow")}</div>
    </div>,
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        { name: "Manrope", data: manropeRegular, weight: 400, style: "normal" },
        { name: "Manrope", data: manropeBold, weight: 700, style: "normal" },
        { name: "Instrument Serif", data: instrumentItalic, weight: 400, style: "italic" },
      ],
    },
  );
}
