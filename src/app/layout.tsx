import type { Metadata } from "next";
import type { ReactNode } from "react";
import { instrumentSerif, manrope } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aman & Partners",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" className={`${manrope.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
