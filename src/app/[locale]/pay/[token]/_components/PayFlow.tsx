"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Building2,
  Check,
  CircleCheck,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  authorizePaymentAction,
  type AuthorizePaymentResult,
} from "@/lib/actions";
import { formatAmount, formatExactTime } from "@/lib/format";

const BANKS = [
  { id: "rbc", name: "RBC Royal Bank", color: "#005DAA" },
  { id: "td", name: "TD Canada Trust", color: "#54B848" },
  { id: "scotiabank", name: "Scotiabank", color: "#EC111A" },
  { id: "bmo", name: "BMO Bank of Montreal", color: "#0079C1" },
  { id: "cibc", name: "CIBC", color: "#B00B1C" },
  { id: "desjardins", name: "Desjardins", color: "#00874E" },
  { id: "nbc", name: "National Bank", color: "#E41C23" },
  { id: "tangerine", name: "Tangerine", color: "#F28500" },
];

type Phase = "pick-bank" | "authorizing" | "paid" | "failed";

export function PayFlow({
  token,
  amountCents,
  description,
}: {
  token: string;
  amountCents: number;
  description: string;
}) {
  const t = useTranslations("pay.flow");
  const locale = useLocale();
  const [phase, setPhase] = useState<Phase>("pick-bank");
  const [bank, setBank] = useState<(typeof BANKS)[number] | null>(null);
  const [result, setResult] = useState<AuthorizePaymentResult | null>(null);
  const [, startTransition] = useTransition();

  function onAuthorize() {
    if (!bank) return;
    setPhase("authorizing");
    startTransition(async () => {
      const res = await authorizePaymentAction({
        token,
        payerBank: bank.name,
        locale,
      });
      setResult(res);
      setPhase(res.ok ? "paid" : "failed");
    });
  }

  if (phase === "paid" && result?.ok) {
    return (
      <div className="rounded-lg border border-[var(--color-good)]/30 bg-[var(--color-surface)] p-6 text-center">
        <CircleCheck
          className="mx-auto size-12 text-[var(--color-good)]"
          aria-hidden
        />
        <h2 className="mt-3 text-xl font-semibold text-[var(--color-ink)]">
          {t("paidTitle")}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {t("paidSubtitle", { amount: formatAmount(amountCents) })}
        </p>
        <dl className="mx-auto mt-5 max-w-xs space-y-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] p-4 text-left text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-subtle)]">
              {t("receiptConfirmation")}
            </dt>
            <dd className="font-mono font-medium text-[var(--color-ink)]">
              {result.confirmationNumber}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-subtle)]">
              {t("receiptPaidAt")}
            </dt>
            <dd className="text-[var(--color-ink)]">
              {formatExactTime(result.paidAt)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-subtle)]">
              {t("receiptBank")}
            </dt>
            <dd className="text-[var(--color-ink)]">{bank?.name}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-[var(--color-ink-subtle)]">
          {t("paidFootnote")}
        </p>
      </div>
    );
  }

  if (phase === "failed" && result && !result.ok) {
    return (
      <div className="rounded-lg border border-[var(--color-bad)]/30 bg-[var(--color-surface)] p-6 text-center">
        <h2 className="text-lg font-semibold text-[var(--color-bad)]">
          {t(`error.${result.reason}` as Parameters<typeof t>[0])}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          {t("errorHint")}
        </p>
      </div>
    );
  }

  if (phase === "authorizing") {
    return (
      <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center">
        <div
          className="mx-auto flex size-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `${bank?.color}18` }}
        >
          <Loader2
            className="size-7 animate-spin"
            style={{ color: bank?.color }}
            aria-hidden
          />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[var(--color-ink)]">
          {t("authorizingTitle", { bank: bank?.name ?? "" })}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {t("authorizingSubtitle")}
        </p>
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-ink-subtle)]">
          <Lock className="size-3" aria-hidden />
          {t("authorizingMockNote")}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <div className="flex items-center gap-2">
        <Building2
          className="size-4 text-[var(--color-ink-muted)]"
          aria-hidden
        />
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">
          {t("pickBankTitle")}
        </h2>
      </div>
      <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
        {t("pickBankHint")}
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-2">
        {BANKS.map((b) => {
          const selected = bank?.id === b.id;
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => setBank(b)}
                aria-pressed={selected}
                className={`flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                  selected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-ink)]"
                    : "border-[var(--color-line-strong)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
                }`}
              >
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: b.color }}
                  aria-hidden
                >
                  {b.name.charAt(0)}
                </span>
                <span className="flex-1 truncate">{b.name}</span>
                {selected && (
                  <Check
                    className="size-4 shrink-0 text-[var(--color-accent)]"
                    aria-hidden
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        disabled={!bank}
        onClick={onAuthorize}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ShieldCheck className="size-4" aria-hidden />
        {bank
          ? t("authorizeCta", {
              amount: formatAmount(amountCents),
              bank: bank.name,
            })
          : t("authorizeCtaDisabled")}
      </button>
      <p className="mt-3 text-center text-xs text-[var(--color-ink-subtle)]">
        {t("descriptionEcho", { description })}
      </p>
    </div>
  );
}
