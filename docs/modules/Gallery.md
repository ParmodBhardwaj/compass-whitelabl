# Gallery

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/Gallery/`
- Config: `module/Gallery/config/module.config.php`

## Routes (extracted)
- `lmcadmin`
- `lmcadmin/gallery`
- `lmcadmin/galcategory`
- `lmcadmin/banner`
- `/admin/gallery[/[:action[/[:id[/]]]]]`
- `/admin/galcategory[/[:action[/[:id[/]]]]]`
- `/admin/banner[/[:action[/[:id[/]]]]]`
- `[/:store][/]galleries[[/cat]/:cat][/[:alias]].html`
- `[[/]:store][/]galleries.html`

## Controllers (extracted)
- IndexController
- GalcategoryController
- BannerController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/gallery/`
- Web routes: `apps/web/src/app/(modules)/gallery/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
