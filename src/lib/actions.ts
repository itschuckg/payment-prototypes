"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { headers } from "next/headers";
import { getProvider } from "./providers/mock-interac";
import { signPayLink } from "./tokens";
import type { Locale } from "@/i18n/routing";

const CreateSchema = z.object({
  externalRef: z
    .string()
    .trim()
    .min(2, "Reference is required")
    .max(64, "Reference too long"),
  amountCents: z
    .number()
    .int("Amount must be a whole number of cents")
    .positive("Amount must be greater than zero")
    .max(10_000_000, "Amount exceeds demo limit ($100,000)"),
  description: z
    .string()
    .trim()
    .min(2, "Description is required")
    .max(140, "Description too long"),
  payerPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Phone looks invalid")
    .optional()
    .or(z.literal("")),
  payerEmail: z
    .string()
    .trim()
    .email("Email looks invalid")
    .optional()
    .or(z.literal("")),
  locale: z.string().min(2).max(5),
});

export type CreateRequestActionInput = z.input<typeof CreateSchema>;

export type CreateRequestActionResult =
  | {
      ok: true;
      requestId: string;
      payUrl: string;
      payRelativeUrl: string;
    }
  | {
      ok: false;
      fieldErrors: Partial<Record<keyof CreateRequestActionInput, string>>;
      formError?: string;
    };

export async function createRequestAction(
  raw: CreateRequestActionInput,
): Promise<CreateRequestActionResult> {
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }
  const data = parsed.data;
  if (!data.payerPhone && !data.payerEmail) {
    return {
      ok: false,
      fieldErrors: {},
      formError: "Provide at least one of payer phone or payer email.",
    };
  }

  const provider = getProvider();
  const request = await provider.createRequest({
    externalRef: data.externalRef,
    amountCents: data.amountCents,
    currency: "CAD",
    description: data.description,
    payerPhone: data.payerPhone || null,
    payerEmail: data.payerEmail || null,
  });

  const token = signPayLink({
    requestId: request.id,
    issuedAt: Date.now(),
    expiresAt: request.expiresAt,
  });

  const payRelativeUrl = `/${data.locale}/pay/${token}`;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const payUrl = `${proto}://${host}${payRelativeUrl}`;

  revalidatePath(`/${data.locale}/clerk`);

  return { ok: true, requestId: request.id, payUrl, payRelativeUrl };
}

export async function cancelRequestAction(
  requestId: string,
  locale: Locale,
): Promise<{ ok: boolean }> {
  const provider = getProvider();
  const result = await provider.cancel(requestId);
  revalidatePath(`/${locale}/clerk`);
  revalidatePath(`/${locale}/clerk/${requestId}`);
  return { ok: !!result };
}
