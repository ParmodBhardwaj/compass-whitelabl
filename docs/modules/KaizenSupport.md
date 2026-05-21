# KaizenSupport

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/KaizenSupport/`
- Config: `module/KaizenSupport/config/module.config.php`

## Routes (extracted)
- `/admin/tpm`
- `/kaizen-support-report[/[:action[/[:id[/]]]]]`
- `/kaizenSupport`
- `[/[:action[/[:id]]]].html`
- `[/:store][/]timeline[/[:action]][/[:id]].html`
- `[/:store][/]preview[/[:action]][/[:id]].html`
- `[/:store][/]created-request-list[/[:action]][/[:id]].html`
- `[/:store][/]download-pdf[/[:action]][/[:id]].html`
- `/dashboard[/[:action[/[:id]]]].html`
- `/kaizen-support-reminder`

## Controllers (extracted)
- HomeController
- IndexController
- TimelineController
- PreviewController
- CreatedRequestController
- DownloadPdfController
- DashboardController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/kaizensupport/`
- Web routes: `apps/web/src/app/(modules)/kaizensupport/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
