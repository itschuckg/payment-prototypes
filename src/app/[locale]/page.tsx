import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Banknote, FileText, ShieldCheck } from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-accent)]">
            {t("heroEyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-muted)]">
            {t("heroSubtitle")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/clerk"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              {t("tryBillerCta")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors"
            >
              {t("learnHowCta")}
            </Link>
          </div>
        </section>

        <aside className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-subtle)]">
            <Banknote className="size-3.5" aria-hidden />
            {t("scenarioBadge")}
          </div>
          <h2 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
            {t("scenarioName")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {t("scenarioDescription")}
          </p>

          <div className="mt-6 space-y-2 text-sm">
            <Link
              href="/clerk"
              className="flex items-center justify-between rounded-md border border-[var(--color-line)] px-3 py-2 text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileText className="size-4" aria-hidden />
                {t("tryBillerCta")}
              </span>
              <ArrowRight className="size-4 text-[var(--color-ink-subtle)]" aria-hidden />
            </Link>
            <Link
              href="/trust"
              className="flex items-center justify-between rounded-md border border-[var(--color-line)] px-3 py-2 text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4" aria-hidden />
                {t("learnTrustCta")}
              </span>
              <ArrowRight className="size-4 text-[var(--color-ink-subtle)]" aria-hidden />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
