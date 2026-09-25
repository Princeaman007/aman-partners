import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
    </>
  );
}
