import { createHmac, timingSafeEqual } from "node:crypto";

const FALLBACK_SECRET =
  "dev-only-payments-atlas-token-secret-do-not-use-in-real-anything";

function getSecret(): string {
  return process.env.TOKEN_SECRET || FALLBACK_SECRET;
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(input: string): Buffer {
  const padded = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

export type PayLinkPayload = {
  requestId: string;
  issuedAt: number;
  expiresAt: number;
};

export function signPayLink(payload: PayLinkPayload): string {
  const body = base64UrlEncode(JSON.stringify(payload));
  const sig = createHmac("sha256", getSecret()).update(body).digest();
  return `${body}.${base64UrlEncode(sig)}`;
}

export function verifyPayLink(
  token: string,
): { ok: true; payload: PayLinkPayload } | { ok: false; reason: string } {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [body, sig] = parts;

  const expected = createHmac("sha256", getSecret()).update(body).digest();
  const provided = base64UrlDecode(sig);
  if (provided.length !== expected.length) {
    return { ok: false, reason: "signature-mismatch" };
  }
  if (!timingSafeEqual(provided, expected)) {
    return { ok: false, reason: "signature-mismatch" };
  }

  let payload: PayLinkPayload;
  try {
    payload = JSON.parse(base64UrlDecode(body).toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed-payload" };
  }
  if (Date.now() > payload.expiresAt) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true, payload };
}
