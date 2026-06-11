import { getTranslations, setRequestLocale } from "next-intl/server";
import { CircleCheck, CircleX, Landmark } from "lucide-react";
import { getProvider } from "@/lib/providers/mock-interac";
import { verifyPayLink } from "@/lib/tokens";
import { formatAmount, formatExactTime } from "@/lib/format";
import { PayFlow } from "./_components/PayFlow";

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pay");

  const verified = verifyPayLink(token);
  if (!verified.ok) {
    return (
      <Terminal
        icon="bad"
        title={verified.reason === "expired" ? t("expiredTitle") : t("invalidTitle")}
        body={verified.reason === "expired" ? t("expiredBody") : t("invalidBody")}
      />
    );
  }

  const provider = getProvider();
  const request = await provider.markViewed(verified.payload.requestId);
  if (!request) {
    return <Terminal icon="bad" title={t("goneTitle")} body={t("goneBody")} />;
  }

  if (request.status === "cancelled") {
    return (
      <Terminal
        icon="bad"
        title={t("cancelledTitle")}
        body={t("cancelledBody")}
      />
    );
  }

  if (request.status === "expired") {
    return (
      <Terminal icon="bad" title={t("expiredTitle")} body={t("expiredBody")} />
    );
  }

  if (request.status === "paid") {
    return (
      <Terminal
        icon="good"
        title={t("alreadyPaidTitle")}
        body={t("alreadyPaidBody", {
          confirmation: request.confirmationNumber ?? "—",
          paidAt: request.paidAt ? formatExactTime(request.paidAt) : "—",
        })}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <div className="text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--color-accent-tint)]">
          <Landmark className="size-6 text-[var(--color-accent)]" aria-hidden />
        </span>
        <p className="mt-3 text-xs font-medium uppercase tracking-widest text-[var(--color-ink-subtle)]">
          {t("billerName")}
        </p>
        <h1 className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
          {request.description}
        </h1>
        <p className="mt-1 font-mono text-xs text-[var(--color-ink-subtle)]">
          {request.externalRef}
        </p>
        <p className="mt-4 font-mono text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
          {formatAmount(request.amountCents)}
        </p>
        <p className="mt-1 text-xs text-[var(--color-ink-subtle)]">
          {t("dueNote", { expires: formatExactTime(request.expiresAt) })}
        </p>
      </div>

      <div className="mt-8">
        <PayFlow
          token={token}
          amountCents={request.amountCents}
          description={request.description}
        />
      </div>

      <p className="mt-6 text-center text-xs text-[var(--color-ink-subtle)]">
        {t("trustFootnote")}
      </p>
    </div>
  );
}

function Terminal({
  icon,
  title,
  body,
}: {
  icon: "good" | "bad";
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      {icon === "good" ? (
        <CircleCheck
          className="mx-auto size-12 text-[var(--color-good)]"
          aria-hidden
        />
      ) : (
        <CircleX
          className="mx-auto size-12 text-[var(--color-ink-subtle)]"
          aria-hidden
        />
      )}
      <h1 className="mt-4 text-xl font-semibold text-[var(--color-ink)]">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-ink-muted)]">
        {body}
      </p>
    </div>
  );
}
