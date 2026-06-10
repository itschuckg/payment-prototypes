export type Currency = "CAD";

export type PaymentMethod = "interac-etransfer-request-money";

export type RequestStatus =
  | "pending"
  | "delivered"
  | "viewed"
  | "authorizing"
  | "paid"
  | "declined"
  | "expired"
  | "cancelled";

export type PaymentRequest = {
  id: string;
  externalRef: string;
  amountCents: number;
  currency: Currency;
  method: PaymentMethod;
  payerEmail: string | null;
  payerPhone: string | null;
  description: string;
  status: RequestStatus;
  createdAt: number;
  updatedAt: number;
  paidAt: number | null;
  expiresAt: number;
  payerBank: string | null;
  confirmationNumber: string | null;
};

export type PaymentEventKind =
  | "request.created"
  | "request.delivered"
  | "request.viewed"
  | "request.authorizing"
  | "request.paid"
  | "request.declined"
  | "request.expired"
  | "request.cancelled";

export type PaymentEvent = {
  id: string;
  requestId: string;
  kind: PaymentEventKind;
  occurredAt: number;
  meta: Record<string, string | number | boolean | null>;
};

export type CreateRequestInput = {
  externalRef: string;
  amountCents: number;
  currency: Currency;
  payerEmail?: string | null;
  payerPhone?: string | null;
  description: string;
  expiresInMs?: number;
};
