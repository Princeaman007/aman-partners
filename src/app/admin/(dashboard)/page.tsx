import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/admin/auth";

/** Vue d'ensemble du dashboard (provisoire : les compteurs arrivent à l'étape D.3). */
export default async function AdminHomePage() {
  // Seconde barrière, derrière le proxy : aucune donnée n'est lue sans session valide.
  await requireAdmin();

  const t = await getTranslations({ locale: "fr", namespace: "Admin.home" });

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-4 leading-relaxed text-muted">{t("text")}</p>
    </div>
  );
}
