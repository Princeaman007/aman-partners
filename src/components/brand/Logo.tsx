import { BrandSymbol } from "./BrandSymbol";

type LogoSize = "sm" | "md" | "lg";

type LogoProps = {
  size?: LogoSize;
  className?: string;
};

const SIZES: Record<LogoSize, { text: string; symbol: number }> = {
  sm: { text: "text-lg", symbol: 24 },
  md: { text: "text-xl", symbol: 28 },
  lg: { text: "text-3xl", symbol: 40 },
};

export function Logo({ size = "md", className = "" }: LogoProps) {
  const { text, symbol } = SIZES[size];

  return (
    <span className={`inline-flex items-center gap-2.5 tracking-tight ${text} ${className}`}>
      <BrandSymbol size={symbol} />
      <span className="whitespace-nowrap">
        <span className="font-bold">Aman</span>
        <span className="mx-[0.12em] font-serif text-[1.15em] leading-none font-normal italic">
          &amp;
        </span>
        <span className="font-normal">Partners</span>
      </span>
    </span>
  );
}
