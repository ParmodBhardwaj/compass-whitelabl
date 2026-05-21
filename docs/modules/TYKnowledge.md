# TYKnowledge

> Auto-generated stub. Fill in as we migrate the module.

## Source
- Laminas module: `module/TYKnowledge/`
- Config: `module/TYKnowledge/config/module.config.php`

## Routes (extracted)
- `lmcadmin/dashboard`
- `lmcadmin/test-your-knowledge/listing`
- `lmcadmin/test-your-knowledge/master`
- `/admin/kpoint`
- `/tyk`
- `/quiz[/:action[/:id]]`
- `/quiz/[:quizId]/question[/:action[/:id]]`
- `/excel-upload[/[:action[/[:id[/]]]]]`
- `/kpoint`
- `/test-your-knowledge[/[:action[/:id]]].html`
- `/test-your-knowledge/submit/[:quizSubmitId]/question[/[:action[/:id]]].html`
- `/test-your-knowledge/submit/[:quizSubmitId]/preview.html`
- `/test-your-knowledge/submit/[:quizSubmitId]/submit.html`

## Controllers (extracted)
- QuizController
- QuestionController

## DB tables touched
TODO — list during migration.

## ACL roles required
TODO.

## Mail / SMS triggers
TODO.

## Integrations
TODO (LDAP / SAP / kPoint / file storage / etc.)

## Migration target
- API module: `apps/api/src/modules/tyknowledge/`
- Web routes: `apps/web/src/app/(modules)/tyknowledge/`
- Wave: TODO

## Parity tests
TODO — Postman/Playwright checklist.
