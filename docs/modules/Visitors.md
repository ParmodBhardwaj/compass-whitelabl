# Visitors

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/Visitors/`
- Config: `module/Visitors/config/module.config.php`

## Routes (extracted)
- `lmcadmin/dashboard`
- `lmcadmin/visitors/locations`
- `lmcadmin/visitors/approvalMembers`
- `lmcadmin/visitors/disabledFields`
- `lmcadmin/visitors/securityMembers`
- `lmcadmin/visitors/instruction`
- `lmcadmin/visitors/question`
- `/admin/visitors`
- `/locations[/[:action[/[:id[/]]]]]`
- `/batch[/[:action[/[:id[/]]]]]`
- `/batch-import[/[:action[/[:id[/]]]]]`
- `/instruction[/[:action[/[:id[/]]]]]`
- `/question[/[:action[/[:id[/]]]]]`
- `/employee-question[/[:action[/[:id[/]]]]]`
- `/feedback-location-department[/[:action[/[:id[/]]]]]`
- `/visitor-pass[/[:action[/[:id[/]]]]]`
- `/canteen-member[/[:action[/[:id[/]]]]]`
- `/reception-member[/[:action[/[:id[/]]]]]`
- `/grade-pass-visible[/[:action[/[:id[/]]]]]`
- `/approval-members[/[:action[/[:id[/]]]]]`
- `/disabled-fields[/[:action[/[:id[/]]]]]`
- `/security-members[/[:action[/[:id[/]]]]]`
- `/visitors`
- `/home[/[:action]].html`
- `[/:location]/appointment[/[:action[/[:id]]]].html`
- `[/:appointment]/frequent-visitor[/[:action[/[:id]]]].html`
- `/employee-approval[/[:action[/[:id]]]].html`
- `/approved-request[/[:action[/[:id]]]].html`
- `/appointment-status[/[:action[/[:id][/:appointmentId]]]].html`
- `/checkout-pending[/[:action[/[:id][/:appointmentId]]]].html`
- `/visitor-request[/[:action[/[:id]]]].html`
- `/visitor-appointment-status[/[:action[/[:id]]]].html`
- `/location-dept-report[/[:action[/[:id]]]].html`
- `/pending-request-report[/[:action[/[:id]]]].html`
- `/feedback-report[/[:action[/[:id]]]].html`
- `/function-report[/[:action[/[:id]]]].html`
- `/employee-feedback-report[/[:action[/[:id]]]].html`
- `/overall-feedback-report[/[:action[/[:id]]]].html`
- `/pending-checkout-report[/[:action[/[:id]]]].html`
- `/pending-employee-feedback[/[:action[/[:id]]]].html`
- `/pending-employee-feedback-report[/[:action[/[:id]]]].html`
- `/employee-feedback[/[:action[/[:id]]]].html`
- `/location-approval-members[/[:action[/[:id]]]].html`
- `[[/locations[/[:id]]]]`
- `/mobile-authentication`
- `/verify-otp`
- `/upload-photo`
- `/material`
- `[[/visitor-information[/[:id]]]]`
- `/gate-pass`
- `/disabled-fields`
- `/contact-person`
- `/visitor-mobile`
- `/generate-otp`
- `/verify-resend-otp`
- `/get-visitor-info-token`
- `/visitor-arrival`
- `/visitor-feedback`
- `/visitor-verification`
- `/feedback-question`
- `/feedback-answer`
- `/expected-arrival`
- `/change-date-time`
- `/meeting-cancel`
- `/visitor-login`
- `/dashboard`
- `/past-appointment-detail`
- `/visitor-logout`
- `/visitor-profile`
- `/contact-person-exist`
- `/cp-meeting`
- `/accept-appointment`
- `/reject-appointment`
- `/approval-members-list`
- `/get-approval-detail`
- `/visitor-pass[[/:action][/[:appointmentId][/:id][/[:type]]]].html`
- `/feedback-notification`
- `/before-notification`
- `/after-notification`
- `/feedback[[/:action][/[:appointmentId][/:id]]].html`
- `/tablet-print-pass[[/:action][/[:appointmentId][/:id]]].html`
- `/dashboard-report-add`
- `/function-report-mail`
- `/defaulter-monthly-mail`
- `/checkout-alert`
- `/truncate-visitor-data[/[:action[/[:id[/]]]]]`
- `/rshris-token-data[/[:action[/[:id[/]]]]]`

## Controllers (extracted)
- VisitorsController
- IndexController
- AppointmentController
- FrequentVisitorController
- EmployeeApprovalController
- AppointmentStatusController
- CheckoutPendingController
- CheckoutAlertController
- VisitorRequestController
- VisitorAppointmentStatusController
- VisitorProfileController
- FeedbackNotificationController
- BeforeNotificationController
- AfterNotificationController
- FeedbackController
- EmployeeFeedbackController
- TabletPrintPassController
- PendingEmployeeFeedbackController
- PendingEmployeeFeedbackReportController
- LocationApprovalMembersController
- ApprovedRequestController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/visitors/`
- Web routes: `apps/web/src/app/(modules)/visitors/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
