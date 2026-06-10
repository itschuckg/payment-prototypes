"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Loader2, Ban } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cancelRequestAction } from "@/lib/actions";
import type { Locale } from "@/i18n/routing";

export function CancelButton({ requestId }: { requestId: string }) {
  const t = useTranslations("clerk.detail");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(t("cancelConfirm"))) return;
        startTransition(async () => {
          await cancelRequestAction(requestId, locale);
          router.refresh();
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-bad)] hover:border-[var(--color-bad)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Ban className="size-3.5" aria-hidden />
      )}
      {t("cancel")}
    </button>
  );
}
