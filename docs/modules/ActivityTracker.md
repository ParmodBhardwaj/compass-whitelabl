# ActivityTracker

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/ActivityTracker/`
- Config: `module/ActivityTracker/config/module.config.php`

## Routes (extracted)
- `lmcadmin`
- `lmcadmin/atracker/programs`
- `lmcadmin/atracker/tasks`
- `/admin/atracker`
- `/programs[/[:action[/[:id[/]]]]]`
- `/tasks[/[:action[/[:id[/]]]]]`
- `/task-report[/[:action[/[:id[/]]]]]`
- `[/:store][/]atrackercron[/[:action[/[:id]]]].html`
- `/atracker`
- `[/:store][/]taskowner[/[:action[/[:id]]]].html`
- `[/:store][/]taskreport[/[:action[/[:id]]]].html`
- `[/:store][/]taskcreator[/[:action[/[:id]]]].html`
- `[/:store][/]creatortaskview[/[:alias]].html`
- `[/:store][/]ownertaskview[/[:alias]].html`
- `[/:store][/]atracker[/[:action[/[:code]]]].html`
- `[/:store][/]tasktransfer[/[:action[/[:id]]]].html`
- `[/:store][/]tasktransferview[/[:alias[/[:id]]]].html`

## Controllers (extracted)
- TaskownerController
- TaskcreatorController
- TasktransferController
- TaskcronController
- HomeController
- ReportController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/activitytracker/`
- Web routes: `apps/web/src/app/(modules)/activitytracker/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
