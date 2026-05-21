# Audit

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/Audit/`
- Config: `module/Audit/config/module.config.php`

## Routes (extracted)
- `/admin/audit`
- `/audit[/[:action[/[:id[/]]]]]`
- `/team[/[:action[/[:id[/]]]]]`
- `/cutoff-date[/[:action[/[:id[/]]]]]`
- `/cutoff-date-report[/[:action[/[:id]]]]`
- `/marked-observation[/[:action[/[:id]]]]`
- `/audit[/]`
- `dashboard[/[:action[/[:id]]]].html`
- `[:audit][/[:theme]]/timeline[/[:action[/[:id]]]].html`
- `[:audit][/:theme]/change-request[/:section][/[:action[/[:id[/[:currentStatus]]]]]].html`
- `[:audit][/:theme]/change-request-reply[/:section][/[:id]].html`
- `[:audit]/comment[/:section][/[:action[/[:id]]]].html`
- `[:audit]/timeline-comment[/:section][/[:id]].html`
- `report[/[:action[/[:id]]]].html`
- `[:audit]/theme[/[:action[/[:id]]]].html`
- `/audit-notification`
- `/audit-emailSend`

## Controllers (extracted)
- IndexController
- TimelineController
- CommentController
- NotificationController
- ReportController
- ChangeRequestController
- ThemeController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/audit/`
- Web routes: `apps/web/src/app/(modules)/audit/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
