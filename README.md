# The Payments Atlas

An interactive, vendor-neutral showcase of Canadian municipal payment patterns.

## v1 scope

- **One pattern**: pay-by-link (clerk-initiated, citizen taps a single URL)
- **One method**: Interac e-Transfer Request Money (fully mocked — no provider account needed)
- **One scenario**: a court fine sent to a citizen via SMS link
- **Two views**: clerk dashboard (the biller) and citizen pay page (the payer)
- **Locales**: English active; French scaffolded but not yet translated
- **PCI scope**: zero (no card data ever enters the system)

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- `next-intl` for i18n with `[locale]` segment routing
- In-process state (Map + EventEmitter) — ephemeral by design; resets per server cold start
- `zod` for input validation
- Target host: Azure Static Web Apps (Standard tier, Canada region)

## Running locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000> — middleware redirects to `/en`.

## Project structure

```
src/
  app/
    [locale]/
      layout.tsx             site chrome (header, footer, sandbox banner)
      page.tsx               landing
      clerk/page.tsx         biller dashboard
      pay/[token]/page.tsx   citizen pay-by-link
      trust/page.tsx         compliance landscape
      how-it-works/page.tsx  protocol walkthrough
  components/                shared UI
  i18n/                      next-intl routing + request config
  lib/                       utilities
  middleware.ts              next-intl locale middleware
messages/
  en.json                    English UI strings
  fr.json                    French stub (TODO translations)
```

## Roadmap

- **v2** — Stripe Elements as a second `PaymentProvider` implementation (cards alongside e-Transfer)
- **v3** — Moneris + Konek (full Canadian payment surface)
- **v4** — US region toggle + ACH
- **v5** — Global Payments, PayPal, Cybersource, full `/compare` matrix
- **v6+** — additional integration patterns (Hosted Page, Unified Portal + SSO)
