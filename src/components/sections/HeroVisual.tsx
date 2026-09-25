import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import styles from "./HeroVisual.module.css";

/** Lignes du parcours, dans le sens de lecture : client, centre, experts, projet livré. */
const PATHS = [
  "M46 130 L170 130",
  "M230 130 C290 130 290 50 344 50",
  "M230 130 L344 130",
  "M230 130 C290 130 290 210 344 210",
  "M200 160 L200 291",
] as const;

const EXPERT_POSITIONS = [50, 130, 210] as const;

type HeroVisualProps = {
  className?: string;
};

export async function HeroVisual({ className }: HeroVisualProps) {
  const t = await getTranslations("Hero");

  return (
    <svg
      viewBox="0 0 400 350"
      role="img"
      aria-label={t("visualLabel")}
      className={cn("h-auto w-full text-foreground", className)}
    >
      {/* Lignes de fond */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="text-border-strong"
      >
        {PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* Points en mouvement le long des lignes */}
      <g fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
        {PATHS.map((d) => (
          <path key={d} d={d} className={styles.flow} />
        ))}
      </g>

      {/* Client */}
      <circle cx={40} cy={130} r={6} fill="currentColor" />

      {/* Aman & Partners : cercle contenant le symbole Convergence */}
      <circle
        cx={200}
        cy={130}
        r={30}
        stroke="currentColor"
        strokeWidth={1.5}
        className="fill-background"
      />
      <g transform="translate(186 116) scale(0.58)">
        <path
          d="M8 42 L24 6 L40 42"
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={24} cy={30} r={4} fill="currentColor" />
      </g>

      {/* Experts */}
      {EXPERT_POSITIONS.map((cy) => (
        <circle key={cy} cx={350} cy={cy} r={5} fill="currentColor" />
      ))}

      {/* Projet livré */}
      <circle
        cx={200}
        cy={300}
        r={9}
        stroke="currentColor"
        strokeWidth={1.5}
        className="fill-background"
      />
      <circle cx={200} cy={300} r={3.5} fill="currentColor" />

      {/* Étiquettes */}
      <g fontSize={14} textAnchor="middle" fill="currentColor">
        <text x={40} y={162} className="text-muted">
          {t("stepClient")}
        </text>
        <text x={200} y={184} fontWeight={600}>
          {t("stepHub")}
        </text>
        <text x={350} y={240} className="text-muted">
          {t("stepExperts")}
        </text>
        <text x={200} y={334} className="text-muted">
          {t("stepDelivered")}
        </text>
      </g>
    </svg>
  );
}
