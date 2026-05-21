# EquipmentEffective

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/EquipmentEffective/`
- Config: `module/EquipmentEffective/config/module.config.php`

## Routes (extracted)
- `lmcadmin/dashboard`
- `lmcadmin/oee/department`
- `lmcadmin/oee/section`
- `lmcadmin/oee/line`
- `lmcadmin/oee/machine`
- `lmcadmin/oee/loss`
- `lmcadmin/oee/phenomena`
- `lmcadmin/oee/group`
- `lmcadmin/oee/model`
- `lmcadmin/oee/holiday`
- `lmcadmin/oee/workingDay`
- `lmcadmin/oee/bottleneck`
- `/admin/oee`
- `/department[/[:action[/[:id[/]]]]]`
- `/section[/[:action[/[:id[/]]]]]`
- `/line[/[:action[/[:id[/]]]]]`
- `/group[/[:action[/[:id[/]]]]]`
- `/group-user[/[:action[/[:id[/]]]]]`
- `/machine[/[:action[/[:id[/]]]]]`
- `/holiday[/[:action[/[:id[/]]]]]`
- `/working-day[/[:action[/[:id[/]]]]]`
- `/loss[/[:action[/[:id[/]]]]]`
- `/phenomena[/[:action[/:loss][/[:id[/]]]]]`
- `/model[/[:action[/[:id[/]]]]]`
- `/bottleneck[/[:action[/[:id[/]]]]]`
- `/excel-upload[/[:action[/[:id[/]]]]]`
- `/section-upload[/[:action[/[:id[/]]]]]`
- `/mfg-coordinator[/[:action[/[:id[/]]]]]`
- `/business-excellence[/[:action[/[:id[/]]]]]`
- `/groupwise-download[/[:action[/[:id[/]]]]]`
- `/oee`
- `[/[:action[/[:id]]]].html`
- `/loss-sheet[/[:type]][/[:action]].html`
- `/performance-report[/[:type]][/[:action]][/:id].html`
- `/performance-percentage[/[:type]][/[:action]][/:id].html`
- `/plant-percentage[/[:type]][/[:action]][/:id].html`
- `[/[:type]]/summary[/[:action]][/:id].html`
- `/skip-line[/[:action]][/:id].html`
- `/monthly-groupwise-upload[/[:action]][/:id].html`
- `/monthly-sectionwise-upload[/[:action]][/:id].html`
- `/monthly-sectionwise-download[/[:action]][/:id].html`
- `/loss-detail-sheet[/[:type]][/[:action]][/:id].html`
- `/group-analysis[/[:action]][/:id]`
- `/section-analysis[/[:action]][/:id]`
- `/oee-escalation[/[:action]][/:id]`

## Controllers (extracted)
- HomeController
- IndexController
- LossSheetController
- PerformanceReportController
- PerformancePercentageController
- PlantPercentageController
- SummaryController
- SkipLineController
- MonthlyGroupwiseUploadController
- MonthlySectionwiseUploadController
- MonthlySectionwiseDownloadController
- LossDetailSheetController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/equipmenteffective/`
- Web routes: `apps/web/src/app/(modules)/equipmenteffective/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
