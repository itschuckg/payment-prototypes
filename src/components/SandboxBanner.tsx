import { useTranslations } from "next-intl";
import { TriangleAlert } from "lucide-react";

export function SandboxBanner() {
  const t = useTranslations("site");
  return (
    <div className="w-full border-b border-[var(--color-warn)]/30 bg-[var(--color-warn-tint)]">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-2 text-xs font-medium text-[var(--color-warn)]">
        <TriangleAlert className="size-3.5" aria-hidden />
        <span>{t("sandboxBanner")}</span>
      </div>
    </div>
  );
}
