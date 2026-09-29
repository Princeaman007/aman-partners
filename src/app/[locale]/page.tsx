import { setRequestLocale } from "next-intl/server";
import { Advantages } from "@/components/sections/Advantages";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Hero } from "@/components/sections/Hero";
import { Problems } from "@/components/sections/Problems";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Timeline } from "@/components/sections/Timeline";
import { createPageMetadata } from "@/lib/seo/metadata";
import { FaqStructuredData } from "@/components/seo/FaqStructuredData";

export const generateMetadata = createPageMetadata("home", "/");

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <FaqStructuredData />
      <Hero />
      <Problems />
      <Services />
      <Timeline />
      <Advantages />
      <Projects />
      <FAQ />
      <FinalCTA />
    </>
  );
}
