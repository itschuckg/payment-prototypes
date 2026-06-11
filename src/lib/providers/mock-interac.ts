import { randomUUID } from "node:crypto";
import type {
  AuthorizeInput,
  AuthorizeResult,
  PaymentProvider,
} from "../provider";
import type {
  CreateRequestInput,
  PaymentEvent,
  PaymentEventKind,
  PaymentRequest,
} from "../types";
import { getStore, recordEvent } from "../store";

const DEFAULT_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30;

function now(): number {
  return Date.now();
}

function makeConfirmation(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function emit(
  request: PaymentRequest,
  kind: PaymentEventKind,
  meta: PaymentEvent["meta"] = {},
) {
  const event: PaymentEvent = {
    id: randomUUID(),
    requestId: request.id,
    kind,
    occurredAt: now(),
    meta,
  };
  recordEvent(event);
}

function persist(request: PaymentRequest) {
  getStore().requests.set(request.id, request);
}

export class MockInteracProvider implements PaymentProvider {
  readonly id = "mock-interac";
  readonly displayName = "Mock Interac e-Transfer";

  async createRequest(input: CreateRequestInput): Promise<PaymentRequest> {
    const id = randomUUID();
    const t = now();
    const request: PaymentRequest = {
      id,
      externalRef: input.externalRef,
      amountCents: input.amountCents,
      currency: input.currency,
      method: "interac-etransfer-request-money",
      payerEmail: input.payerEmail ?? null,
      payerPhone: input.payerPhone ?? null,
      description: input.description,
      status: "pending",
      createdAt: t,
      updatedAt: t,
      paidAt: null,
      expiresAt: t + (input.expiresInMs ?? DEFAULT_EXPIRY_MS),
      payerBank: null,
      confirmationNumber: null,
    };
    persist(request);
    emit(request, "request.created", { externalRef: input.externalRef });

    setTimeout(() => this.markDelivered(id), 600);
    return request;
  }

  private async markDelivered(id: string) {
    const store = getStore();
    const r = store.requests.get(id);
    if (!r || r.status !== "pending") return;
    const updated: PaymentRequest = {
      ...r,
      status: "delivered",
      updatedAt: now(),
    };
    persist(updated);
    emit(updated, "request.delivered");
  }

  async getRequest(id: string): Promise<PaymentRequest | null> {
    return getStore().requests.get(id) ?? null;
  }

  async markViewed(id: string): Promise<PaymentRequest | null> {
    const store = getStore();
    const r = store.requests.get(id);
    if (!r) return null;
    if (r.status === "paid" || r.status === "expired" || r.status === "cancelled") {
      return r;
    }
    if (now() > r.expiresAt) {
      const expired: PaymentRequest = {
        ...r,
        status: "expired",
        updatedAt: now(),
      };
      persist(expired);
      emit(expired, "request.expired");
      return expired;
    }
    if (r.status === "viewed" || r.status === "authorizing") {
      return r;
    }
    const updated: PaymentRequest = {
      ...r,
      status: "viewed",
      updatedAt: now(),
    };
    persist(updated);
    emit(updated, "request.viewed");
    return updated;
  }

  async authorize(input: AuthorizeInput): Promise<AuthorizeResult> {
    const store = getStore();
    const r = store.requests.get(input.requestId);
    if (!r) return { ok: false, reason: "not-found" };
    if (r.status === "paid") return { ok: false, reason: "already-paid" };
    if (now() > r.expiresAt) {
      const expired: PaymentRequest = {
        ...r,
        status: "expired",
        updatedAt: now(),
      };
      persist(expired);
      emit(expired, "request.expired");
      return { ok: false, reason: "expired" };
    }

    const authorizing: PaymentRequest = {
      ...r,
      status: "authorizing",
      payerBank: input.payerBank,
      updatedAt: now(),
    };
    persist(authorizing);
    emit(authorizing, "request.authorizing", { bank: input.payerBank });

    await new Promise((res) => setTimeout(res, 1200));

    const t = now();
    const paid: PaymentRequest = {
      ...authorizing,
      status: "paid",
      paidAt: t,
      updatedAt: t,
      confirmationNumber: makeConfirmation(),
    };
    persist(paid);
    emit(paid, "request.paid", {
      bank: input.payerBank,
      confirmation: paid.confirmationNumber!,
    });
    return { ok: true, request: paid };
  }

  async cancel(id: string): Promise<PaymentRequest | null> {
    const store = getStore();
    const r = store.requests.get(id);
    if (!r) return null;
    if (r.status === "paid") return r;
    const updated: PaymentRequest = {
      ...r,
      status: "cancelled",
      updatedAt: now(),
    };
    persist(updated);
    emit(updated, "request.cancelled");
    return updated;
  }

  async listRequests(): Promise<PaymentRequest[]> {
    return Array.from(getStore().requests.values()).sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  }

  async listEvents(requestId: string): Promise<PaymentEvent[]> {
    const list = getStore().events.get(requestId) ?? [];
    return [...list].sort((a, b) => a.occurredAt - b.occurredAt);
  }
}

let cached: MockInteracProvider | null = null;
export function getProvider(): MockInteracProvider {
  if (!cached) cached = new MockInteracProvider();
  return cached;
}
