/**
 * /admin/sopOperation/process — SOP (Plant Operation) Process listing.
 *
 * Backed by the same `sop_process` table as /admin/process — the
 * Plant-Operation flavour just uses the plant-operation sections. The
 * read-only summary, status badges and section filter are identical, so
 * we re-export the existing page component verbatim.
 */
export { default } from '@/app/admin/process/page';
