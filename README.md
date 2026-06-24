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

### Activating payments (Paddle)

Checkout stays in a safe **"coming soon"** state until two things are set:
1. `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` (+ `NEXT_PUBLIC_PADDLE_ENV`) in env.
2. A Paddle **price id** (`pri_…`) for each plan in `src/lib/catalog.ts` (`paddlePriceId`).

Until then the cart and pricing pages work for browsing; only the final "Pay" button is disabled.

## What's next (later phases)

3. **Webhooks** — `POST /api/webhooks/paddle` (signature-verified): payment success →
   create/extend a LicenseGate license + store subscription + send the Brevo email;
   payment failure / cancellation → **block** the license.
4. **Invoices** — list + link Paddle-hosted invoices on the Licenses page.
5. **License validation API + macOS apps** — `POST /api/licenses/validate` for the apps to
   call (wrapping LicenseGate), plus the Swift side: 7-day trial from install date, a
   *License* section in Settings (validity + date, or a key field + buy link), a background
   validity check that disables the app when expired/blocked, and Sparkle for updates.

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

### Deploy to Vercel

1. Push this folder to a Git repo and import it in Vercel.
2. Add a Neon Postgres integration (or set `DATABASE_URL` manually).
3. Set env vars from `.env.example` (at minimum `DATABASE_URL`, `AUTH_SECRET`,
   `NEXT_PUBLIC_SITE_URL`). `AUTH_URL` is auto-detected on Vercel.
4. Run the migration once against the production DB (`npm run db:push` locally pointed at
   the prod `DATABASE_URL`, or via a CI step).

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
