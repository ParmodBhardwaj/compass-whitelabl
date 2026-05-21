/**
 * Server-side brand config — read once at module load from env.
 * Used in Excel report titles, email subjects/bodies, mail "from" address.
 *
 * Override per-deployment via env: BRAND_NAME, BRAND_LEGAL_NAME,
 * BRAND_PRODUCT, MAIL_FROM, etc.
 */
export const BRAND = {
  name: process.env.BRAND_NAME ?? 'Compass',
  legalName: process.env.BRAND_LEGAL_NAME ?? 'Compass',
  productName: process.env.BRAND_PRODUCT ?? 'Compass Portal',
  mailFrom: process.env.MAIL_FROM ?? 'noreply@example.com',
};

/** Standardized title string for Excel report headers. */
export function reportTitle(report: string): string {
  return `${BRAND.productName} — ${report}`;
}
