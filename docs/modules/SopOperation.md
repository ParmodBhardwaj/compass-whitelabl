# SopOperation

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/SopOperation/`
- Config: `module/SopOperation/config/module.config.php`

## Routes (extracted)
- `lmcadmin`
- `lmcadmin/sopOperation/process`
- `/admin/sop-process/`
- `process[/[:action[/[:id[/]]]]]`
- `sections[/[:type[/[:action[/[:id[/]]]]]]]`
- `feedback[/[:action[/[:id[/]]]]]`
- `level-one[/[:action[/[:id[/]]]]]`
- `activity-report[/[:action[/[:id[/]]]]]`
- `/sop-process`
- `/home[/[:action]].html`
- `/sop[/[:alias]].html`
- `[/:store][/]sopcron[/[:action[/[:id]]]].html`

## Controllers (extracted)
- SopcronController
- IndexController
- HomeController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/sopoperation/`
- Web routes: `apps/web/src/app/(modules)/sopoperation/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
