import { setRequestLocale } from "next-intl/server";
import { Advantages } from "@/components/sections/Advantages";
import { Hero } from "@/components/sections/Hero";
import { Problems } from "@/components/sections/Problems";
import { Services } from "@/components/sections/Services";
import { Timeline } from "@/components/sections/Timeline";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Problems />
      <Services />
      <Timeline />
      <Advantages />
    </>
  );
}
