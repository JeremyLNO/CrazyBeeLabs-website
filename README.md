# Crazy Bee Labs — account & licensing platform

The CrazyBeeLabs.com app: **accounts, cart, payments and licenses** for the macOS apps.
macOS apps are free to download (7-day trial); a license bought here keeps them running.

> ⚠️ This is a **cloud-deployed** app (Vercel + Neon). There is no Node on the build
> machine, so it was written but **not run locally** — the first `vercel` build is the
> real test. Share any build error and it gets fixed.

## Stack

- **Next.js 15** (App Router, TypeScript) — deploy on **Vercel**
- **Neon** Postgres + **Drizzle ORM**
- **Auth.js v5** — email + password (credentials), JWT sessions, bcrypt hashing
- Third-party tools (wired in later phases): **Paddle** (payments), **LicenseGate**
  (license keys), **Brevo** (email), **Sparkle** (macOS app updates)

## What's built

**Phase 1 — foundations + accounts**
- Email/password **sign-up**, **login**, **logout**, JWT session
- Protected **/account** area (middleware + per-page guard)
- **Account overview** and **Licenses** page (empty state until purchases exist)
- Full **database schema** (users, email tokens, subscriptions, licenses, invoices)
- **Brevo** email helper + verification-email scaffolding (inert until `BREVO_API_KEY` is set)
- Branded UI following the Crazy Bee Labs charter (black + honey)
- Product **catalogue** in code: the 6 paid macOS apps × 4 plans (`src/lib/catalog.ts`)

**Phase 2 — pricing + cart + checkout**
- **Pricing** overview (`/pricing`) and **per-app plan page** (`/apps/[slug]`) with the 4 plans
- **Cart** (`/cart`): client state in localStorage, one plan per app, header cart badge
- **Paddle checkout** wired (`@paddle/paddle-js` overlay) — passes the cart line items,
  the customer email and `customData { userId, items }` so the webhook can provision
- Checkout requires login (`callbackUrl` back to `/cart`)

**Phase 3 — provisioning webhook**
- `POST /api/webhooks/paddle` — **signature-verified** Paddle webhook
- Payment success → creates/extends the **subscription + license** (validity from the plan:
  month/quarter/year, or perpetual for lifetime), records the **invoice**, and emails the
  key(s) via Brevo
- Non-payment / cancellation / pause → **blocks** the license
- Keys are generated locally (`CBL-…`) and also registered in **LicenseGate** when configured;
  our DB stays the source of truth

**Phase 4 — invoices**
- Invoices page (`/account/invoices`) + per-license invoice link on the Licenses page

**Phase 5 (web) — license validation API**
- `POST /api/licenses/validate` (also `GET ?key=&bundleId=` for testing) — the macOS apps
  check a key here; **our DB is authoritative**. Returns
  `{ valid, status, validUntil, appSlug, reason }` and binds a key to its app via bundle id.

**Admin dashboard** — `/admin`, restricted to `ADMIN_EMAILS` (defaults to jeremy@lno.company)
- Sales overview: revenue (all-time / 30 days), orders, active licenses, paying customers,
  breakdown by app & plan
- All **orders** and all **licenses** across every customer

### Activating payments (Paddle)

Checkout stays in a safe **"coming soon"** state until:
1. `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` (+ `NEXT_PUBLIC_PADDLE_ENV`) in env.
2. A Paddle **price id** (`pri_…`) for each plan in `src/lib/catalog.ts` (`paddlePriceId`).
3. In Paddle → **Notifications**, add a destination to
   `https://<your-domain>/api/webhooks/paddle`, copy its secret into `PADDLE_WEBHOOK_SECRET`,
   and (optionally) set `PADDLE_API_KEY` so invoice links are fetched.

Until then the cart and pricing pages work for browsing; only the final "Pay" button is disabled.

## What's next

- **macOS app integration** — the drop-in Swift license kit (`CrazyBeeLicense`, separate
  package) wires the 7-day trial, the Settings "License" section, the background validity
  check (against `/api/licenses/validate`), and Sparkle updates.
- **Port the marketing site** into this Next.js app.
- Connect the real Paddle / LicenseGate / Brevo accounts.

## Setup

Requires Node 20+ (locally or just on Vercel).

```bash
# 1. Database — create a project at https://neon.tech and copy the connection string
# 2. Environment
cp .env.example .env.local
#    set DATABASE_URL and generate AUTH_SECRET:  openssl rand -base64 32

# 3. Install + create the tables
npm install
npm run db:push          # or: npm run db:generate && npm run db:migrate

# 4. Run
npm run dev              # http://localhost:3000
```

### Deploy to Vercel (already wired)

The repo is connected to Vercel + Neon, so **every push to `main` auto-deploys** to
production (pull requests get preview deployments). To finish first-time setup:

1. **Env vars** (Vercel → Settings → Environment Variables):
   - `DATABASE_URL` — set automatically by the Neon integration (just verify it's there).
   - `AUTH_SECRET` — `openssl rand -base64 32`.
   - `NEXT_PUBLIC_SITE_URL` — your production URL.

   (`AUTH_URL` isn't needed — `trustHost` is enabled in `auth.config.ts`.)
2. **Create the tables** — no Node needed: paste `drizzle/0000_init.sql` into the
   **Neon SQL editor** and run it once.
3. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy) so it picks up the new env vars.

### Continuous deployment

- **Vercel** builds + deploys on every push to `main` automatically — nothing to run.
- **GitHub Actions CI** (`.github/workflows/ci.yml`) compiles + type-checks on every
  push/PR, so build errors surface on GitHub too.
- **Schema changes to Neon** stay deliberate (never auto-applied to a live DB): paste
  updated SQL in the Neon editor, or run the **"DB push to Neon"** Action manually
  (needs a `DATABASE_URL` repo secret).
- `./scripts/ship.sh "message"` = commit everything + push (→ triggers the deploy).

## Environment variables

See `.env.example`. Each third-party tool stays **inert** until its key is present:
- no `BREVO_API_KEY` → sign-up still works, emails are just logged
- no `PADDLE_*` / `LICENSEGATE_*` → checkout / license generation are disabled

`AUTH_ALLOW_UNVERIFIED=true` lets people sign in before verifying their email — keep it
`true` until Brevo is live, then flip to `false` to require verification.

## Project map

```
src/
  app/
    layout.tsx, globals.css, page.tsx      # shell + home
    login/, signup/                        # auth pages
    account/                               # protected: overview + licenses
    api/
      auth/[...nextauth]/route.ts          # Auth.js handler
      signup/route.ts                      # create account
  lib/
    db/schema.ts, db/index.ts              # Drizzle schema + Neon client
    auth.ts, auth.config.ts                # Auth.js (full + edge-safe)
    catalog.ts                             # apps × plans (Paddle price ids go here)
    users.ts, password.ts, tokens.ts       # account helpers
    validators.ts, env.ts, licenses.ts
    email/brevo.ts                         # transactional email (inert until keyed)
  components/                              # site chrome, auth forms, account nav
  middleware.ts                            # protects /account
public/apps/                               # real app icons
```

## Security notes

- Passwords are hashed with bcrypt; never stored or logged in plaintext.
- Sessions are signed JWTs (`AUTH_SECRET`).
- Paddle webhooks (Phase 3) **must** verify the signature before trusting any event.
- No third-party secret is ever exposed to the browser (only `NEXT_PUBLIC_*` values are).
