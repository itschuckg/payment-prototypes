import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleCheck, CircleDot } from "lucide-react";
import { getProvider } from "@/lib/providers/mock-interac";
import { signPayLink } from "@/lib/tokens";
import { formatAmount, formatExactTime, formatRelative } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { CancelButton } from "./_components/CancelButton";
import { headers } from "next/headers";
import type { PaymentEventKind } from "@/lib/types";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<PaymentEventKind, string> = {
  "request.created": "Request created",
  "request.delivered": "Link delivered (mock)",
  "request.viewed": "Citizen opened the pay link",
  "request.authorizing": "Authorizing inside bank",
  "request.paid": "Payment confirmed",
  "request.declined": "Payment declined",
  "request.expired": "Request expired",
  "request.cancelled": "Cancelled by clerk",
};

export default async function ClerkRequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("clerk.detail");

  const provider = getProvider();
  const request = await provider.getRequest(id);
  if (!request) notFound();

  const events = await provider.listEvents(id);

  const token = signPayLink({
    requestId: request.id,
    issuedAt: request.createdAt,
    expiresAt: request.expiresAt,
  });
  const payRelativeUrl = `/${locale}/pay/${token}`;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const payUrl = `${proto}://${host}${payRelativeUrl}`;

  const canCancel =
    request.status !== "paid" &&
    request.status !== "cancelled" &&
    request.status !== "expired";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/clerk"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        {t("backToList")}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <code className="font-mono text-sm text-[var(--color-ink-muted)]">
              {request.externalRef}
            </code>
            <StatusBadge status={request.status} />
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {request.description}
          </h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {formatAmount(request.amountCents)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-ink-subtle)]">
            {request.currency}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">
              {t("timelineTitle")}
            </h2>
            <span className="text-xs text-[var(--color-ink-subtle)]">
              {t("timelineHint")}
            </span>
          </div>
          <ol className="px-5 py-4">
            {events.map((e, idx) => {
              const isLast = idx === events.length - 1;
              const isPaid = e.kind === "request.paid";
              return (
                <li key={e.id} className="relative pl-7 pb-5 last:pb-0">
                  {!isLast && (
                    <span
                      className="absolute left-[10px] top-5 bottom-0 w-px bg-[var(--color-line-strong)]"
                      aria-hidden
                    />
                  )}
                  <span
                    className="absolute left-0 top-1.5 flex size-5 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)]"
                    aria-hidden
                  >
                    {isPaid ? (
                      <CircleCheck className="size-4 text-[var(--color-good)]" />
                    ) : (
                      <CircleDot className="size-3 text-[var(--color-ink-subtle)]" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {EVENT_LABEL[e.kind] ?? e.kind}
                    </p>
                    <p
                      className="text-xs text-[var(--color-ink-subtle)]"
                      title={formatExactTime(e.occurredAt)}
                    >
                      {formatRelative(e.occurredAt)}
                    </p>
                    {Object.keys(e.meta).length > 0 && (
                      <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                        {Object.entries(e.meta).map(([k, v]) => (
                          <div key={k} className="flex items-baseline gap-1">
                            <dt className="text-[10px] uppercase tracking-wider text-[var(--color-ink-subtle)]">
                              {k}
                            </dt>
                            <dd className="font-mono text-xs text-[var(--color-ink-muted)]">
                              {String(v)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">
              {t("payLinkTitle")}
            </h2>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              {t("payLinkHint")}
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-[var(--color-bg)] p-2">
              <code className="flex-1 truncate font-mono text-xs text-[var(--color-ink)]">
                {payUrl}
              </code>
              <CopyButton
                value={payUrl}
                label={t("copyLink")}
                copiedLabel={t("copiedLink")}
              />
            </div>
            <a
              href={payRelativeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            >
              {t("openLink")}
            </a>
          </section>

          <section className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">
              {t("detailsTitle")}
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <DetailRow label={t("payerPhone")} value={request.payerPhone} />
              <DetailRow label={t("payerEmail")} value={request.payerEmail} />
              <DetailRow
                label={t("payerBank")}
                value={request.payerBank ?? "—"}
              />
              <DetailRow
                label={t("confirmation")}
                value={request.confirmationNumber ?? "—"}
                mono
              />
              <DetailRow
                label={t("created")}
                value={formatExactTime(request.createdAt)}
              />
              <DetailRow
                label={t("expires")}
                value={formatExactTime(request.expiresAt)}
              />
              {request.paidAt && (
                <DetailRow
                  label={t("paidAt")}
                  value={formatExactTime(request.paidAt)}
                />
              )}
            </dl>
            {canCancel && (
              <div className="mt-4 border-t border-[var(--color-line)] pt-4">
                <CancelButton requestId={request.id} />
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-subtle)]">
        {label}
      </dt>
      <dd
        className={`text-right text-sm text-[var(--color-ink)] ${mono ? "font-mono" : ""}`}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}
