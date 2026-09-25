import type { SVGProps } from "react";

type BrandSymbolProps = Omit<SVGProps<SVGSVGElement>, "children" | "width" | "height"> & {
  size?: number;
  title?: string;
};

/** En dessous de cette taille (en pixels), le trait et le point sont épaissis. */
const SMALL_SIZE = 32;

export function BrandSymbol({ size = 48, title, ...props }: BrandSymbolProps) {
  const isSmall = size <= SMALL_SIZE;
  const strokeWidth = isSmall ? 5 : 4;
  const dotRadius = isSmall ? 4.5 : 4;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M8 42 L24 6 L40 42"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="30" r={dotRadius} fill="currentColor" />
    </svg>
  );
}
