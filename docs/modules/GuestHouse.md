# GuestHouse

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/GuestHouse/`
- Config: `module/GuestHouse/config/module.config.php`

## Routes (extracted)
- `lmcadmin`
- `lmcadmin/guest-houses`
- `lmcadmin/house-location`
- `lmcadmin/booking-list`
- `/admin/guest-houses[/[:action[/[:id[/]]]]]`
- `/admin/booking-list[/[:action[/[:id[/]]]]]`
- `/admin/house-location[/[:action[/[:id[/]]]]]`
- `/guest`
- `[/:store][/]guest-house[/[:action[/[:alias]]]].html`
- `[/:store][/]guest-house-search[/[:action[/[:id]]]]`

## Controllers (extracted)
- IndexController
- HomeController
- LocationsController
- BookingListController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/guesthouse/`
- Web routes: `apps/web/src/app/(modules)/guesthouse/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
