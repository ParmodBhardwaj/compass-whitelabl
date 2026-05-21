# Kaizen

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/Kaizen/`
- Config: `module/Kaizen/config/module.config.php`

## Routes (extracted)
- `lmcadmin/dashboard`
- `lmcadmin/tpm/kaizen/pillar`
- `lmcadmin/tpm/kaizen/benefit`
- `lmcadmin/tpm/kaizen/theme`
- `lmcadmin/tpm/kaizen/nonMachine`
- `lmcadmin/tpm/kaizen/unitMeasurement`
- `lmcadmin/tpm/kaizen/machine`
- `lmcadmin/tpm/kaizen/machineUpload`
- `/kaizen`
- `/pillar[/[:action[/[:id[/]]]]]`
- `/theme[/[:action[/[:id[/]]]]]`
- `/benefit[/[:action[/[:id[/]]]]]`
- `/section[/[:action[/[:id[/]]]]]`
- `/loss[/[:action[/[:id[/]]]]]`
- `/non-machine[/[:action[/[:id[/]]]]]`
- `/unit-measurement[/[:action[/[:id[/]]]]]`
- `/machine[/[:action[/[:id[/]]]]]`
- `/machine-upload[/[:action[/[:id[/]]]]]`
- `/kaizen-department[/[:action[/[:id[/]]]]]`
- `[/[:action[/[:id]]]].html`
- `[/:kaizen]/timeline[/[:action[/[:id]]]].html`
- `[/:kaizen]/reports[/[:id]].html`
- `/plant-reports[/[:action[/[:id]]]].html`
- `/kaizen-dashboard[/[:action[/[:id]]]].html`

## Controllers (extracted)
- KaizenController
- TimelineController
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
- API module: `apps/api/src/modules/kaizen/`
- Web routes: `apps/web/src/app/(modules)/kaizen/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
