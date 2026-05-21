# Training

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/Training/`
- Config: `module/Training/config/module.config.php`

## Routes (extracted)
- `/admin/genre`
- `/:type[/[:action[/[:id[/]]]]]`
- `/admin/sub-category`
- `/training`
- `[/[:action]].html`
- `/league.html`
- `/report[/[:action]].html`
- `/champion-ambassador[/[:action[/[:id]]]].html`
- `/score-report.html`
- `/detailed-report.html`
- `/training-listing[/[:action[/[:id]]]].html`

## Controllers (extracted)
- IndexController
- ReportController
- ChampionAmbassadorController
- TrainingLisitngController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/training/`
- Web routes: `apps/web/src/app/(modules)/training/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
