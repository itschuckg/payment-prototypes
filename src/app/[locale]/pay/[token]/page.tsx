import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function PayPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pay");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
        Pay your bill
      </h1>
      <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{t("stub")}</p>
      <p className="mt-6 font-mono text-xs text-[var(--color-ink-subtle)]">
        token: {token}
      </p>
    </div>
  );
}
