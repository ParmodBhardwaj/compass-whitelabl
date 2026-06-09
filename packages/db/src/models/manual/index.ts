/**
 * Hand-maintained Sequelize models.
 *
 * These describe tables that aren't always present in the DB introspection
 * dump (e.g. Insurance — `insurance_documents`, `insurance_faqs`,
 * `insurance_hyperlinks`). Keeping the models in this folder (NOT under
 * `generated/`) ensures they survive `pnpm db:generate-models` runs on a
 * deployment server whose database is missing the tables.
 *
 * Add a new manual model here when:
 *   • a Laminas legacy entity exists but the matching table isn't in your
 *     local DB dump, or
 *   • you want to ship a model whose shape is more carefully tuned than the
 *     auto-generator output.
 */
export { InsuranceDocuments } from './InsuranceDocuments.model';
export { InsuranceFaqs } from './InsuranceFaqs.model';
export { InsuranceHyperlinks } from './InsuranceHyperlinks.model';
