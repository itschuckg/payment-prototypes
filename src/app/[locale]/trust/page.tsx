import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function TrustPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("trust");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
        Trust & compliance landscape
      </h1>
      <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{t("stub")}</p>
    </div>
  );
}
