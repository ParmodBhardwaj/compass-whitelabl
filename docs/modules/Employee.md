# Employee

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/Employee/`
- Config: `module/Employee/config/module.config.php`

## Routes (extracted)
- `lmcadmin`
- `lmcadmin/employee`
- `lmcadmin/offRoleEmployee`
- `lmcadmin/dealer`
- `lmcadmin/department`
- `lmcadmin/location`
- `lmcadmin/section`
- `profile`
- `/admin[/]`
- `login`
- `logout`
- `/admin/employee[/[:action[/[:id[/]]]]]`
- `/admin/off-role-employee[/[:action[/[:id[/]]]]]`
- `/admin/dealer[/[:action[/[:id[/]]]]]`
- `/admin/department[/[:action[/[:id[/]]]]]`
- `/admin/location[/[:action[/[:id[/]]]]]`
- `/admin/section[/[:action[/[:id[/]]]]]`
- `login[/[:action[/[:id[/]]]]]`
- `[/:store][/]employee/pending.html`
- `/admin/[/:store]profile[/[:action[/[:id[/]]]]]`

## Controllers (extracted)
- IndexController
- OffRoleEmployeeController
- DealerController
- DepartmentController
- LocationController
- SectionController
- ProfileController
- PendingApprovalController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/employee/`
- Web routes: `apps/web/src/app/(modules)/employee/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
