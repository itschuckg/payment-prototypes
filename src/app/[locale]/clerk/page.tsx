import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProvider } from "@/lib/providers/mock-interac";
import { formatAmount, formatRelative } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { NewRequestForm } from "./_components/NewRequestForm";
import { ArrowRight, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClerkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("clerk");
  const provider = getProvider();
  const requests = await provider.listRequests();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-accent)]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-muted)]">
          {t("subtitle")}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
              <h2 className="text-sm font-semibold text-[var(--color-ink)]">
                {t("listTitle")}
              </h2>
              <span className="text-xs text-[var(--color-ink-subtle)]">
                {t("listCount", { count: requests.length })}
              </span>
            </div>

            {requests.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                <Inbox
                  className="size-8 text-[var(--color-ink-subtle)]"
                  aria-hidden
                />
                <p className="text-sm text-[var(--color-ink-muted)]">
                  {t("empty")}
                </p>
                <p className="text-xs text-[var(--color-ink-subtle)]">
                  {t("emptyHint")}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-line)]">
                {requests.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/clerk/${r.id}`}
                      className="group flex items-start justify-between gap-4 px-5 py-4 hover:bg-[var(--color-bg)] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs text-[var(--color-ink-muted)]">
                            {r.externalRef}
                          </code>
                          <StatusBadge status={r.status} />
                        </div>
                        <p className="mt-1 truncate text-sm text-[var(--color-ink)]">
                          {r.description}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--color-ink-subtle)]">
                          {r.payerPhone ?? r.payerEmail ?? "—"} ·{" "}
                          {formatRelative(r.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-sm font-medium text-[var(--color-ink)]">
                          {formatAmount(r.amountCents)}
                        </span>
                        <ArrowRight
                          className="size-4 text-[var(--color-ink-subtle)] group-hover:text-[var(--color-ink)] transition-colors"
                          aria-hidden
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside>
          <NewRequestForm />
        </aside>
      </div>
    </div>
  );
}
