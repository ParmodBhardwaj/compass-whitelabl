# SOP

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/SOP/`
- Config: `module/SOP/config/module.config.php`

## Routes (extracted)
- `lmcadmin`
- `lmcadmin/process`
- `/admin/process[/[:action[/[:id[/]]]]]`
- `/admin/sections[/[:action[/[:id[/]]]]]`
- `/admin/feedback[/[:action[/[:id[/]]]]]`
- `/admin/level-one[/[:action[/[:id[/]]]]]`
- `/admin/activity-report[/[:action[/[:id[/]]]]]`
- `/sop-home.html`
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
- API module: `apps/api/src/modules/sop/`
- Web routes: `apps/web/src/app/(modules)/sop/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
