import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");
  return (
    <footer className="mt-auto border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-6 text-xs text-[var(--color-ink-subtle)] sm:flex-row sm:items-center sm:justify-between">
        <span>{t("neutralNote")}</span>
        <span className="font-mono">{t("version")}</span>
      </div>
    </footer>
  );
}
