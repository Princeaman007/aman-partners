import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ContainerSize = "default" | "narrow";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
};

const SIZES: Record<ContainerSize, string> = {
  default: "max-w-6xl",
  narrow: "max-w-3xl",
};

export function Container({ size = "default", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-6 sm:px-8 lg:px-12", SIZES[size], className)}
      {...props}
    />
  );
}
