# Miscellaneous

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/Miscellaneous/`
- Config: `module/Miscellaneous/config/module.config.php`

## Routes (extracted)
- `lmcadmin/dashboard`
- `lmcadmin/miscellaneous/emailTemplate`
- `/admin/mis`
- `/state[/[:action[/[:id[/]]]]]`
- `/districts[/[:action[/[:id[/]]]]]`
- `/template/email[/[:action[/[:id[/]]]]]`
- `/meeting-document[/[:action[/[:id[/]]]]]`
- `/meeting-summary-document[/[:action[/[:id[/]]]]]`
- `/banner[/[:action[/[:id[/]]]]]`
- `/pledge[/[:action[/[:id[/]]]]]`
- `/miscellaneous`
- `/miscellaneous[/[:action[/[:id[/]]]]].html`
- `/grievances[/[:action[/[:id[/]]]]].html`
- `/repository-document[/[:action[/[:id]]]].html`

## Controllers (extracted)
- IndexController
- GrievancesController
- StatesController
- DistrictsController
- RepositoryDocumentController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/miscellaneous/`
- Web routes: `apps/web/src/app/(modules)/miscellaneous/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
