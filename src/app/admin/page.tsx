import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { logoutAction } from "./actions";

/** Accueil provisoire du dashboard (remplacé à l'étape D.2). */
export default async function AdminHomePage() {
  // Seconde barrière, derrière le proxy : aucune donnée n'est lue sans session valide.
  await requireAdmin();

  const t = await getTranslations({ locale: "fr", namespace: "Admin" });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("home.title")}</h1>
      <p className="mt-4 leading-relaxed text-muted">{t("home.text")}</p>

      <form action={logoutAction} className="mt-10">
        <Button type="submit" variant="secondary">
          {t("layout.logout")}
        </Button>
      </form>
    </main>
  );
}
