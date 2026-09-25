import { getTranslations, setRequestLocale } from "next-intl/server";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md rounded-lg border border-border bg-surface p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("tagline")}</p>
      </div>
    </main>
  );
}
