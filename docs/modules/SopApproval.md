# SopApproval

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/SopApproval/`
- Config: `module/SopApproval/config/module.config.php`

## Routes (extracted)
- `/admin/sop-approval`
- `/department[/[:action[/[:id[/]]]]]`
- `/section[/[:action[/[:id[/]]]]]`
- `/stakeholder[/[:action[/[:id[/]]]]]`
- `/sop-approval`
- `/home[/[:action[/[:id]]]].html`
- `[/:store][/]process[/[:action][/[:id]]].html`
- `[/:store][/]timeline[/[:action]][/[:id]].html`
- `[/]:processId[/]procedure[/[:action][/[:id]]].html`
- `[/:store][/]revised[/[:action][/[:id]]].html`
- `[/:store][/]my-approval[/[:action]][/[:id]].html`
- `/sop-escalation-notification`

## Controllers (extracted)
- HomeController
- ProcessController
- ProcedureController
- TimelineController
- RevisedController
- MyApprovalController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/sopapproval/`
- Web routes: `apps/web/src/app/(modules)/sopapproval/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
