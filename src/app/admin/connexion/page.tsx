import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/brand/Logo";

/** Page de connexion au dashboard. */
export default async function AdminLoginPage() {
  const t = await getTranslations({ locale: "fr", namespace: "Admin.login" });

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-10 text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("description")}</p>

        <div className="mt-8 rounded-lg border border-border bg-surface p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm">
          <Link
            href="/"
            className="rounded-sm text-muted underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-foreground hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {t("backToSite")}
          </Link>
        </p>
      </div>
    </main>
  );
}
