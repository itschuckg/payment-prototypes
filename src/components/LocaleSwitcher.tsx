"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import { routing, type Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface)] text-xs"
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            disabled={active || isPending}
            onClick={() =>
              startTransition(() => {
                router.replace(pathname, { locale: l });
              })
            }
            aria-pressed={active}
            className={
              active
                ? "bg-[var(--color-ink)] text-white px-2 py-1 rounded-[5px] m-px font-medium"
                : "px-2 py-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
