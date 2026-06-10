import type { RequestStatus } from "./types";

const CAD = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export function formatAmount(cents: number): string {
  return CAD.format(cents / 100);
}

export function parseAmountToCents(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const dollars = Number.parseFloat(cleaned);
  if (!Number.isFinite(dollars) || dollars <= 0) return null;
  return Math.round(dollars * 100);
}

export function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function formatExactTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export type StatusTheme = {
  label: string;
  tone: "neutral" | "info" | "warn" | "good" | "bad";
};

export const statusTheme: Record<RequestStatus, StatusTheme> = {
  pending: { label: "Pending", tone: "neutral" },
  delivered: { label: "Delivered", tone: "info" },
  viewed: { label: "Viewed", tone: "info" },
  authorizing: { label: "Authorizing", tone: "warn" },
  paid: { label: "Paid", tone: "good" },
  declined: { label: "Declined", tone: "bad" },
  expired: { label: "Expired", tone: "bad" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
