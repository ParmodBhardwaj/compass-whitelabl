# Hero Compass — Re-platform

Node.js + Next.js + NestJS + Sequelize migration of the legacy Laminas PHP portal.

## Stack
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Backend:** NestJS 10, TypeScript, Sequelize
- **DB:** MySQL — existing schema (368 tables), no schema rewrites in Phase 1
- **Auth:** JWT (access + refresh), LDAP + Google + legacy `lmc_user` providers
- **Workers:** BullMQ (Redis) for cron / escalation mail (Wave 2+)
- **Integrations:** SAP SOAP, kPoint, SMTP (Nodemailer), SMS gateway
- **File storage:** Multer + local disk (configurable via `FILE_STORAGE_ROOT`)

## Layout
```
apps/
  api/                  NestJS API
    src/common/upload/    shared Multer upload module
    src/modules/<name>/   one folder per Laminas module
  web/                  Next.js (App Router)
    src/app/portal/       end-user portal (matches legacy layout)
    src/app/admin/        admin CRUD pages
packages/
  db/                   Sequelize models + scripts
    scripts/generate-models-from-sql.ts
    scripts/load-dump.ts        ← imports DatabaseDump.sql into MySQL
    scripts/seed.ts             ← seeds sample portal content
  auth/                 JWT + bcrypt + LDAP helpers
  integrations/         SAP, kPoint, mail, sms adapters
  ui/                   shared React components
workers/                BullMQ jobs (escalation cron) — Wave 2+
docs/modules/           per-module spec one-pagers extracted from Laminas
```

## Wave 1 — what's runnable now

### API (`/v2/*`)
- `GET  /v2/health`
- **Auth** — `POST /auth/login` (LDAP), `GET /auth/google`, `GET /auth/google/callback`,
  `POST /auth/refresh`, `GET /auth/me`
- **Employees** — `GET /employees`, `/employees/departments`, `/employees/locations`,
  `/employees/birthdays`, `/employees/by-ecode/:ecode`, `/employees/:id`
- **CMS pages** — full CRUD `GET|POST /cms/pages`, `PUT|DELETE /cms/pages/:id`,
  `GET /cms/pages/by-alias/:alias`, image attachments
  `POST /cms/pages/:id/images`, `DELETE /cms/pages/images/:imageId`
- **Banners** — `GET|POST /banners/home`, `PUT|DELETE /banners/home/:id`,
  `GET|POST /banners?store=...`, `PUT|DELETE /banners/:id`
- **Menu** — `GET /menus` (user tree), `GET /menus/admin`, full CRUD,
  `PUT /menus/reorder`
- **News** — full CRUD with featured / internal-vs-external flags
- **Gallery** — categories + galleries + multi-image upload
  (`POST /galleries/:id/images`), set-featured, bulk delete
- **Policy** — full CRUD with sections (`/policies/sections`),
  role assignment (`PUT /policies/:id/roles`),
  admin users (`PUT /policies/:id/admins`), logs (`GET /policies/:id/logs`)
- **Activity** — recent-activity cards CRUD
- **Favourites** — `GET|POST|DELETE /favourites` (right-panel "Favorite" tab)
- **Recent View** — `POST /recent-views/track`, `GET /recent-views/recent`,
  `GET /recent-views/most-viewed`
- **Search** — `GET /search?q=…` (CMS pages, news, galleries, menu, activities, policy)
- **Upload** — `POST /uploads/one`, `POST /uploads/many`
  (returns `{ url: '/files/...' }`, served by Nest static)
- **Wave 2 (in progress)** — SOP, Audit Tracker (with 30d/0d/+7d/+15d escalation)

### Web routes
- `/` — landing
- `/login` — username/password (LDAP) + Google
- `/portal` — main portal homepage (banners carousel, news strip, photo gallery, MY APPLICATIONS panel) — matches the legacy screenshot
- `/portal/news/[alias]`, `/portal/galleries`, `/portal/galleries/[alias]`,
  `/portal/cms/[alias]` — content detail views
- `/admin` — admin dashboard
- `/admin/pages` — CMS pages CRUD + image upload
- `/admin/news` — news CRUD + featured flag + image upload
- `/admin/gallery` — galleries + categories + multi-image upload + delete + featured
- `/admin/menu` — header / sidebar / footer menu CRUD
- `/admin/banners` — home banner carousel + per-store banner strips
- `/admin/policy` — policies + sections CRUD + role / admin assignment
- `/admin/employees` — directory with department / location / grade filters
- `/admin/activities` — recent-activity cards CRUD

## Getting started

### 1. Prerequisites
- Node.js 20.10+
- pnpm 9 (`npm i -g pnpm`)
- MySQL 5.7+ or 8.x running locally
- (optional) Redis if you want to test workers in Wave 2

### 2. Install
```sh
cd hero-compass
pnpm install
cp .env.example .env
# edit .env — set at least DB_HOST/USER/PASSWORD/NAME and JWT_*_SECRET
```

### 3. Load the legacy database
```sh
pnpm db:load-dump        # creates the DB and imports DatabaseDump.sql
pnpm db:generate-models  # regenerates Sequelize models from the dump
pnpm db:seed             # OPTIONAL: seed sample banners/news/gallery for empty installs
```

### 4. Build packages, then run
```sh
pnpm -r build            # compiles @hero/db, @hero/auth, @hero/integrations
pnpm dev                 # API on :4000, Web on :4321 (per apps/web/package.json)
```

Open:
- http://localhost:4321/ — landing
- http://localhost:4321/login — sign in
- http://localhost:4321/portal — main portal (faithful clone of legacy layout)
- http://localhost:4321/admin — admin dashboard

### 5. Authentication notes
- The `POST /v2/auth/login` route uses the **LDAP** strategy. To test without a
  live LDAP server, replace `@UseGuards(AuthGuard('ldap'))` on `AuthController.login`
  with a local-only password verify against `lmc_user.password` (`bcryptjs.compare`)
  during development. The legacy bcrypt hashes from `lmc_user` are compatible.
- Google login expects `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI`
  to be set in `.env`.

### 6. File storage
Uploaded files go to `${FILE_STORAGE_ROOT}/images/...` (defaults to `./storage`)
and are served at `/files/...` by the API. The CMS / News / Gallery / Banner
admin UIs all use the shared `FileUpload` component which calls
`POST /v2/uploads/{one|many}` and stores the returned URL in the relevant DB column.

## Migrating data + behaviour

- **Schema**: untouched. Every model is auto-generated from `DatabaseDump.sql`
  into `packages/db/src/models/generated/`. Rerun `pnpm db:generate-models`
  if the schema changes.
- **Strangler rollout**: when ready, point Nginx `location /v2/ {}` at the new
  API and keep the legacy PHP on `/`. Cut over modules by adding more rewrites.

## Reference docs
- [../Refrence/](../Refrence/) — original PDFs / Word docs (source of truth)
- [docs/modules/](docs/modules/) — per-Laminas-module spec stubs with extracted
  routes & controllers
- [../plans/i-have-this-code-optimized-book.md](../../.claude/plans/i-have-this-code-optimized-book.md) — overall migration plan

## Wave roadmap

| Wave | Modules | Status |
|------|---------|--------|
| 0 | auth, acl, db, upload, employee | ✅ done |
| 1 | cms, menu, news, gallery, policy, activity, favourites/recentview, search, banners | ✅ done |
| 2 | sop, audit (with 30d/0d/+7d/+15d escalation), tpm (hazard/OPL/tag), activity-tracker, kaizen, idea, kpoint, oee, mp-sheet, workers (BullMQ) | 🟡 in progress (SOP + Audit core merged) |
| 3 | guesthouse, carpool, visitors, salerent, dni, training, insurance, tax, tcg, rnd | ⏳ |
| 4 | sap-integration, ldap-integration, reports, excel-report, rest-api | ⏳ |
