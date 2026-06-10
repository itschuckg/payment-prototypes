"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import {
  createRequestAction,
  type CreateRequestActionInput,
} from "@/lib/actions";
import { parseAmountToCents } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";

type FieldErrors = Partial<
  Record<keyof CreateRequestActionInput | "amountDisplay", string>
>;

const PRESETS = [
  {
    label: "Speeding fine",
    externalRef: "TICKET-77123",
    amount: "125.00",
    description: "Speeding fine — 19 km/h over limit, Apr 24 2026",
    payerPhone: "+15145550199",
  },
  {
    label: "Property tax instalment",
    externalRef: "TAX-2026-Q2-44128",
    amount: "1843.50",
    description: "Property tax — Q2 2026 instalment, 123 Rue Sainte-Catherine",
    payerEmail: "owner@example.ca",
  },
  {
    label: "Dog licence renewal",
    externalRef: "DOG-LIC-9921",
    amount: "42.00",
    description: "Annual dog licence renewal — tag 9921",
    payerPhone: "+14165550144",
  },
];

export function NewRequestForm() {
  const t = useTranslations("clerk.form");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<{
    requestId: string;
    payUrl: string;
    payRelativeUrl: string;
  } | null>(null);

  const [externalRef, setExternalRef] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [description, setDescription] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [payerEmail, setPayerEmail] = useState("");

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setExternalRef(preset.externalRef);
    setAmountDisplay(preset.amount);
    setDescription(preset.description);
    setPayerPhone(preset.payerPhone ?? "");
    setPayerEmail(preset.payerEmail ?? "");
    setErrors({});
    setFormError(null);
    setCreated(null);
  }

  function reset() {
    setExternalRef("");
    setAmountDisplay("");
    setDescription("");
    setPayerPhone("");
    setPayerEmail("");
    setErrors({});
    setFormError(null);
    setCreated(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setCreated(null);

    const cents = parseAmountToCents(amountDisplay);
    if (cents === null) {
      setErrors({ amountDisplay: t("errorAmountInvalid") });
      return;
    }

    startTransition(async () => {
      const result = await createRequestAction({
        externalRef,
        amountCents: cents,
        description,
        payerPhone,
        payerEmail,
        locale,
      });
      if (!result.ok) {
        setErrors(result.fieldErrors);
        setFormError(result.formError ?? null);
        return;
      }
      setErrors({});
      setCreated({
        requestId: result.requestId,
        payUrl: result.payUrl,
        payRelativeUrl: result.payRelativeUrl,
      });
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <h2 className="text-base font-semibold text-[var(--color-ink)]">
        {t("title")}
      </h2>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-[var(--color-ink-subtle)]">
          {t("presetsLabel")}
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className="rounded-md border border-[var(--color-line-strong)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          label={t("externalRef")}
          hint={t("externalRefHint")}
          error={errors.externalRef}
        >
          <input
            value={externalRef}
            onChange={(e) => setExternalRef(e.target.value)}
            placeholder="TICKET-77123"
            className={inputClass}
            disabled={pending}
          />
        </Field>

        <Field
          label={t("amount")}
          hint={t("amountHint")}
          error={errors.amountDisplay ?? errors.amountCents}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-ink-subtle)]">
              $
            </span>
            <input
              value={amountDisplay}
              onChange={(e) => setAmountDisplay(e.target.value)}
              placeholder="125.00"
              inputMode="decimal"
              className={`${inputClass} pl-7`}
              disabled={pending}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--color-ink-subtle)]">
              CAD
            </span>
          </div>
        </Field>

        <Field
          label={t("description")}
          hint={t("descriptionHint")}
          error={errors.description}
          full
        >
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Speeding fine — 24 Apr 2026"
            className={inputClass}
            disabled={pending}
          />
        </Field>

        <Field
          label={t("payerPhone")}
          hint={t("payerPhoneHint")}
          error={errors.payerPhone}
        >
          <input
            value={payerPhone}
            onChange={(e) => setPayerPhone(e.target.value)}
            placeholder="+1 514 555 0199"
            className={inputClass}
            disabled={pending}
          />
        </Field>

        <Field
          label={t("payerEmail")}
          hint={t("payerEmailHint")}
          error={errors.payerEmail}
        >
          <input
            value={payerEmail}
            onChange={(e) => setPayerEmail(e.target.value)}
            placeholder="payer@example.ca"
            className={inputClass}
            disabled={pending}
          />
        </Field>

        {formError && (
          <p className="sm:col-span-2 text-sm text-[var(--color-bad)]">
            {formError}
          </p>
        )}

        <div className="sm:col-span-2 flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {t("submit")}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="rounded-md px-3 py-2 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors disabled:opacity-60"
          >
            {t("reset")}
          </button>
        </div>
      </form>

      {created && (
        <div className="mt-6 rounded-md border border-[var(--color-good)]/30 bg-[var(--color-good-tint)]/50 p-4">
          <p className="text-sm font-medium text-[var(--color-good)]">
            {t("createdTitle")}
          </p>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
            {t("createdHint")}
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-2">
            <code className="flex-1 truncate font-mono text-xs text-[var(--color-ink)]">
              {created.payUrl}
            </code>
            <CopyButton
              value={created.payUrl}
              label={t("copyLink")}
              copiedLabel={t("copiedLink")}
            />
            <a
              href={created.payRelativeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors"
            >
              {t("openLink")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 disabled:bg-[var(--color-bg)] disabled:cursor-not-allowed";

function Field({
  label,
  hint,
  error,
  full,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-xs font-medium text-[var(--color-ink)]">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {error ? (
        <span className="mt-1 block text-xs text-[var(--color-bad)]">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-[var(--color-ink-subtle)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
