import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function SiteHeader() {
  const t = useTranslations();
  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="text-base font-semibold tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
            {t("site.name")}
          </span>
          <span className="hidden text-xs text-[var(--color-ink-subtle)] sm:inline">
            {t("site.tagline")}
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/clerk"
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            {t("nav.clerk")}
          </Link>
          <Link
            href="/how-it-works"
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            {t("nav.howItWorks")}
          </Link>
          <Link
            href="/trust"
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            {t("nav.trust")}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
