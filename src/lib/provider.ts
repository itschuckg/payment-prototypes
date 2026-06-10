import type {
  CreateRequestInput,
  PaymentRequest,
  PaymentEvent,
} from "./types";

export type AuthorizeInput = {
  requestId: string;
  payerBank: string;
};

export type AuthorizeResult =
  | { ok: true; request: PaymentRequest }
  | { ok: false; reason: "expired" | "already-paid" | "not-found" | "declined" };

export interface PaymentProvider {
  readonly id: string;
  readonly displayName: string;

  createRequest(input: CreateRequestInput): Promise<PaymentRequest>;
  getRequest(id: string): Promise<PaymentRequest | null>;
  markViewed(id: string): Promise<PaymentRequest | null>;
  authorize(input: AuthorizeInput): Promise<AuthorizeResult>;
  cancel(id: string): Promise<PaymentRequest | null>;
  listRequests(): Promise<PaymentRequest[]>;
  listEvents(requestId: string): Promise<PaymentEvent[]>;
}
