import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");
  const otherLocale = locale === "fr" ? "en" : "fr";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("tagline")}</p>
      <Link
        href="/"
        locale={otherLocale}
        lang={otherLocale}
        className="mt-10 rounded-sm text-sm font-medium underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      >
        {t("switchLocale")}
      </Link>
    </main>
  );
}
