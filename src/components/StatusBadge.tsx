import type { RequestStatus } from "@/lib/types";
import { statusTheme } from "@/lib/format";

const toneClass = {
  neutral:
    "bg-[var(--color-line)] text-[var(--color-ink-muted)] border-[var(--color-line-strong)]",
  info: "bg-[var(--color-accent-tint)] text-[var(--color-accent)] border-[var(--color-accent)]/30",
  warn: "bg-[var(--color-warn-tint)] text-[var(--color-warn)] border-[var(--color-warn)]/30",
  good: "bg-[var(--color-good-tint)] text-[var(--color-good)] border-[var(--color-good)]/30",
  bad: "bg-[var(--color-bad-tint)] text-[var(--color-bad)] border-[var(--color-bad)]/30",
} as const;

export function StatusBadge({ status }: { status: RequestStatus }) {
  const theme = statusTheme[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClass[theme.tone]}`}
    >
      <span
        className={`size-1.5 rounded-full ${theme.tone === "warn" ? "animate-pulse" : ""} bg-current`}
        aria-hidden
      />
      {theme.label}
    </span>
  );
}
