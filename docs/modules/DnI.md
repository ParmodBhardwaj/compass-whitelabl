# DnI

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/DnI/`
- Config: `module/DnI/config/module.config.php`

## Routes (extracted)
- `lmcadmin`
- `lmcadmin/dni/event`
- `lmcadmin/dni/initiative`
- `lmcadmin/dni/newsletter`
- `lmcadmin/dni/video`
- `/admin/dni`
- `/event[/[:action[/[:id[/]]]]]`
- `/newsletter[/[:action[/[:id[/]]]]]`
- `/initiative[/[:action[/[:id[/]]]]]`
- `/video[/[:action[/[:id[/]]]]]`
- `/featured[/[:action[/[:id[/]]]]]`
- `/dni`
- `/dni[/[:action[/[:id]]]].html`
- `[/:store][/[type/:type]][/]dni-event[/[:alias]].html`
- `[/:store][/]video[/[:alias]].html`
- `[/:store][/]newsletter[/[:alias]].html`
- `[/:store][/]initiative[/[:alias]].html`
- `[/:store][/]featured[/[:alias]].html`

## Controllers (extracted)
- HomeController
- EventController
- NewsletterController
- VideoController
- InitiativeController
- FeaturedController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/dni/`
- Web routes: `apps/web/src/app/(modules)/dni/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
