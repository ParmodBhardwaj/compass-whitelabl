# Idea

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/Idea/`
- Config: `module/Idea/config/module.config.php`

## Routes (extracted)
- `lmcadmin`
- `lmcadmin/idea`
- `lmcadmin/ideabanner`
- `lmcadmin/ideacontent`
- `/admin/idea[/[:action[/[:id[/]]]]]`
- `/admin/category[/[:action[/[:id[/]]]]]`
- `/admin/ideasub[/[:action[/[:id[/]]]]]`
- `/admin/ideabanner[/[:action[/[:id[/]]]]]`
- `/admin/ideacontent[/[:action[/[:id[/]]]]]`
- `[/:store][/]idea[/:alias].html`

## Controllers (extracted)
- IdeaController
- CategoryController
- IdeaSubmittedController
- BannerController
- ContentController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/idea/`
- Web routes: `apps/web/src/app/(modules)/idea/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
