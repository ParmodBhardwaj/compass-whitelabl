# Compass — White-Label Employee Portal

Node.js + Next.js + NestJS + Sequelize re-platform of a legacy Laminas PHP
employee portal. Brand-neutral by default; re-skin per deployment via env vars.

## Stack
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Backend:** NestJS 10, TypeScript, Sequelize-typescript
- **DB:** MySQL — existing schema (368 tables) preserved as-is
- **Auth:** JWT (access + refresh), LDAP + Google + local providers
- **Workers:** PM2 cron + tsx scripts (audit + TPM + activity-tracker escalation, SAP sync)
- **Integrations:** SAP SOAP, kPoint, SMTP (Nodemailer), SMS gateway
- **File storage:** Multer + local disk (configurable via `FILE_STORAGE_ROOT`)

## Layout
```
apps/
  api/                  NestJS API
    src/common/upload/    shared Multer upload module
    src/common/excel/     shared Excel exporter (replaces PhpSpreadsheet)
    src/common/brand.ts   server-side brand config
    src/modules/<name>/   one folder per legacy module
    src/workers/          cron workers (audit, tpm, sap-sync, etc.)
  web/                  Next.js (App Router)
    src/lib/brand.ts      client-side brand config
    src/app/portal/       end-user portal
    src/app/admin/        admin CRUD pages
    public/img/           brand logo + static assets
packages/
  db/                   Sequelize models + scripts
  auth/                 JWT + bcrypt + LDAP helpers
  integrations/         SAP, kPoint, mail, sms adapters
  ui/                   shared React components
tools/parity/           DB-vs-API parity test suite (60 tests)
docs/modules/           per-module spec one-pagers
```

## White-labeling

Every user-facing brand string flows through one of two config files:

- `apps/web/src/lib/brand.ts` — client-side (sidebar, header, footer, login, gate pass)
- `apps/api/src/common/brand.ts` — server-side (Excel report titles, email bodies)

Override per-deployment via env vars (set in `.env`):

```
# Server-side
BRAND_NAME=Acme
BRAND_LEGAL_NAME=Acme Inc.
BRAND_PRODUCT=Acme Portal
MAIL_FROM=noreply@acme.com

# Client-side (must be NEXT_PUBLIC_ to reach the browser)
NEXT_PUBLIC_BRAND_NAME=Acme
NEXT_PUBLIC_BRAND_LEGAL_NAME=Acme Inc.
NEXT_PUBLIC_BRAND_PRODUCT=Acme Portal
NEXT_PUBLIC_BRAND_TAGLINE=Employee portal
NEXT_PUBLIC_BRAND_WELCOME=Welcome
NEXT_PUBLIC_BRAND_LOGO=/img/brand-logo.svg
NEXT_PUBLIC_BRAND_COPYRIGHT_YEAR=2014
```

Drop your logo at `apps/web/public/img/brand-logo.svg` (or override the URL
via `NEXT_PUBLIC_BRAND_LOGO`). Default is a neutral compass mark.

Code identifiers (`HeroCmsPages` class names, `hero_*` MySQL table names,
`@hero/db` workspace package names) stay as-is — they're schema-frozen and
not user-visible.

## Getting started

### 1. Prerequisites
- Node.js 20.10+
- pnpm 9 (`npm i -g pnpm`)
- MySQL 5.7+ or 8.x running locally
- (optional) Redis for workers

### 2. Install
```sh
pnpm install
cp .env.example .env
# edit .env — set DB credentials, JWT secrets, and BRAND_* if you want to re-brand
```

### 3. Load the legacy database
```sh
pnpm db:load-dump        # creates the DB and imports DatabaseDump.sql
pnpm db:generate-models  # regenerates Sequelize models from the dump
pnpm db:seed             # OPTIONAL: seed sample content for empty installs
```

### 4. Build & run
```sh
pnpm -r build            # compiles @hero/db, @hero/auth, @hero/integrations
pnpm dev                 # API on :4000, Web on :4321
```

Open:
- http://localhost:4321/ — landing
- http://localhost:4321/login — sign in
- http://localhost:4321/portal — main portal
- http://localhost:4321/admin — admin dashboard

### 5. Authentication notes
- `POST /v2/auth/login` supports local (bcrypt against `employee.password`),
  LDAP, and Google OAuth.
- Configure `LDAP_*` / `GOOGLE_*` env vars to enable those providers.
- Legacy `lmc_user` bcrypt hashes verify directly via `bcryptjs.compare`.

### 6. File storage
Uploaded files land in `${FILE_STORAGE_ROOT}/images/...` (default `./storage`)
and are served at `/files/...` by the API. The admin UIs use the shared
`FileUpload` component → `POST /v2/uploads/{one|many}`.

## Parity tests

Run `node tools/parity/runner.mjs` to verify the API matches DB ground truth.
60 tests across 10 modules. Returns exit code 0 on green so it's CI-ready.

## Workers (cron)

Registered in `ecosystem.config.js` via PM2 cron-restart:

| Job | Schedule | Source |
|---|---|---|
| audit-tracker-escalation | `0 7 * * *` | `apps/api/src/workers/audit-tracker-escalation.ts` |
| tpm-hazard-escalation | `0 8 * * *` | `apps/api/src/workers/tpm-hazard-escalation.ts` |
| mpsheet-reminder | `0 9 * * *` | `apps/api/src/workers/mpsheet-reminder.ts` |
| activity-tracker-escalation | `0 7 * * *` | `apps/api/src/workers/activity-tracker-escalation.ts` |
| sap-sync (token) | `1 5,8 * * *` | `apps/api/src/workers/sap-sync.ts token` |
| sap-sync (views) | `11 5 * * *`, `21 6 * * *` | `apps/api/src/workers/sap-sync.ts views` |

## Migration progress

| Wave | Modules | Status |
|------|---------|--------|
| 0 | auth, acl, db, upload, employee | ✅ |
| 1 | cms, menu, news, gallery, policy, activity, favourites/recentview, search, banners | ✅ |
| 2 | sop, audit (4-stage escalation), tpm (hazard/OPL), activity-tracker, kaizen, idea, kpoint, oee, mp-sheet | ✅ |
| 3 | guesthouse, carpool, visitors (full workflow), salerent, dni, training, insurance, tax, tcg, rnd | ✅ |
| 4 | sap, reports, excel-report, audit-log middleware, cron workers | ✅ |
| 5 | Cutover (Nginx routing, decommission PHP) | ⏳ |
