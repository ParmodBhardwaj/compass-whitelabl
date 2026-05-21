# Tpm

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/Tpm/`
- Config: `module/Tpm/config/module.config.php`

## Routes (extracted)
- `lmcadmin/dashboard`
- `lmcadmin/tpm/listing`
- `lmcadmin/tpm/master`
- `lmcadmin/tpm/nonStaffListing`
- `lmcadmin/tpm/nonStaff`
- `lmcadmin/tpm/non-staff`
- `lmcadmin/tpm/plant`
- `lmcadmin/tpm/plantApplications`
- `lmcadmin/tpm/escalation`
- `lmcadmin/tpm/matrix`
- `lmcadmin/tpm/category`
- `lmcadmin/tpm/officer`
- `lmcadmin/tpm/injury`
- `lmcadmin/tpm/injuryList`
- `lmcadmin/tpm/injuryReason`
- `lmcadmin/tpm/adviser`
- `lmcadmin/tpm/subCategory`
- `lmcadmin/tpm/hazard`
- `lmcadmin/tpm/hazardRequest`
- `lmcadmin/tpm/hazardOfficer`
- `lmcadmin/tpm/nonEquipment`
- `lmcadmin/tpm/classification`
- `lmcadmin/tpm/tagType`
- `lmcadmin/tpm/equipmentListing`
- `lmcadmin/tpm/equipment`
- `lmcadmin/tpm/pillar`
- `lmcadmin/tpm/theme`
- `lmcadmin/tpm/topic`
- `lmcadmin/tpm/opexTeam`
- `tpm/home`
- `tpm/tag`
- `/admin/tpm`
- `/hazard-request[/[:action[/[:id[/]]]]]`
- `/category[/[:action[/[:id[/]]]]]`
- `/sub-category[/[:action[/[:id[/]]]]]`
- `/officer[/[:action[/[:id[/]]]]]`
- `/injury[/[:action[/[:id[/]]]]]`
- `/sub-body-part[/[:action[/[:id[/]]]]]`
- `/injury-nature[/[:action[/[:id[/]]]]]`
- `/injury-list[/[:action[/[:id[/]]]]]`
- `/adviser[/[:action[/[:id[/]]]]]`
- `/hazard[/[:action[/[:id[/]]]]]`
- `/master[/[:action[/[:id[/]]]]]`
- `/non-staff[/[:action[/[:id[/]]]]]`
- `/non-staff-listing[/[:action[/[:id[/]]]]]`
- `/listing[/[:action[/[:id[/]]]]]`
- `/plant[/[:action[/[:id[/]]]]]`
- `/plant-applications[/[:action[/[:id[/]]]]]`
- `/escalation[/[:action[/[:id[/]]]]]`
- `/escalation/[:plant]/matrix/[:application][/[:action[/[:id[/]]]]]`
- `/tag-type[/[:action[/[:id[/]]]]]`
- `/classification[/[:action[/[:id[/]]]]]`
- `/tag-list[/[:action[/[:id[/]]]]]`
- `/non-equipment[/[:action[/[:id[/]]]]]`
- `/equipment[/[:action[/[:id[/]]]]]`
- `/equipment-listing[/[:action[/[:id[/]]]]]`
- `/pending-tag[/[:action[/[:id[/]]]]]`
- `/pillar[/[:action[/[:id[/]]]]]`
- `/theme[/[:action[/[:id[/]]]]]`
- `/department[/[:action[/[:id[/]]]]]`
- `/section[/[:action[/[:id[/]]]]]`
- `/topic[/[:action[/[:id[/]]]]]`
- `/opex-team[/[:action[/[:id[/]]]]]`
- `/injury/department[/[:action[/[:id[/]]]]]`
- `/injury/section[/[:action[/[:id[/]]]]]`
- `/officer/hr[/[:action[/[:id[/]]]]]`
- `/hazard-safety[/[:action[/[:id[/]]]]]`
- `/tpm`
- `/home[/[:action]].html`
- `[/:store][/]hazard[/[:action][/[:id]]].html`
- `[/:store][/]hazard-timeline[/:action][/:id].html`
- `[/:store][/]injury[/[:action][/[:id]]].html`
- `[/:store][/]injury-report[/[:action][/[:id]]].html`
- `[/:store][/]injury/timeline[/:action][/:id].html`
- `[/:store][/]injury-dashboard[/[:action][/[:id]]].html`
- `[/:store][/]tag[/[:action][/[:id]]].html`
- `[/:store][/]tag/tag[[:action][/[:id]][/[:type]][/[:typeId]]][/[:ageing]][/[:ageType]].html`
- `[/:store][/]tag/timeline[/:action][/:id].html`
- `[/:store][/]tag-report[/:action]/type[/][:type][/:section].html`
- `[/:store][/]tag-request[/:action][/[:id]].html`
- `[/:store][/]report[/:action][/:id].html`
- `[/:store][/]plant-report[/:action[/:id]].html`
- `[/:store][/]chart[/:action][/:id].html`
- `[/:store][/]opl[/[:action][/[:id]]].html`
- `[/:store][/]opl-app[/[:action][/[:id]]].html`
- `[/:store][/]opl/opex[/[:action][/[:id]]].html`
- `[/:store][/]opl-dashboard[/[:action]][/[:id]].html`
- `[/:store][/]opl-report[/:action]/type[/][:type][/:section].html`
- `/escalation-notification`
- `/injury-escalation-notification`
- `/injury-operator-cron`
- `/opl-escalation`
- `/tag-notification`
- `/tpm-emailSend`

## Controllers (extracted)
- HomeController
- HazardController
- HazardTimelineController
- EscalationController
- ReportController
- PlantReportController
- ChartController
- ChartReportController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/tpm/`
- Web routes: `apps/web/src/app/(modules)/tpm/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
