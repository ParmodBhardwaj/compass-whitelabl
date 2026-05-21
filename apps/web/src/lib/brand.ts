/**
 * Centralized brand / white-label config.
 *
 * All user-facing brand strings on the web side resolve through here so a
 * deployment can re-brand the portal by setting `NEXT_PUBLIC_BRAND_*` env
 * vars at build time — no code change required.
 *
 * Code identifiers (TypeScript class names like `HeroCmsPages`, MySQL table
 * names like `hero_*`, package names like `@hero/api`) stay as-is — they're
 * schema-frozen and not user-visible.
 */

export const BRAND = {
  /** Short brand name shown in wordmarks, headers, alts. */
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Compass',

  /** Full legal-ish brand name (used in copyright + meta description). */
  legalName: process.env.NEXT_PUBLIC_BRAND_LEGAL_NAME ?? 'Compass',

  /** Product/portal name shown in titles. */
  productName: process.env.NEXT_PUBLIC_BRAND_PRODUCT ?? 'Compass Portal',

  /** Tagline shown under titles + in <meta description>. */
  tagline:
    process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? 'Employee portal',

  /** Logo URL — served from /public/ by default. */
  logoUrl: process.env.NEXT_PUBLIC_BRAND_LOGO ?? '/img/brand-logo.svg',

  /** Logo URL fallback if the primary 404s. */
  logoFallback: '/img/brand-logo.svg',

  /** Earliest copyright year. Override per-deploy. */
  copyrightStartYear: Number(
    process.env.NEXT_PUBLIC_BRAND_COPYRIGHT_YEAR ?? new Date().getFullYear(),
  ),

  /** Welcome banner on the login page. */
  welcomeMessage:
    process.env.NEXT_PUBLIC_BRAND_WELCOME ?? 'Welcome',

  /** Email used in printable artifacts (gate passes, reports). */
  supportEmail:
    process.env.NEXT_PUBLIC_BRAND_SUPPORT_EMAIL ?? 'support@example.com',
};

/** Convenience copyright string. */
export function copyrightLine(): string {
  const now = new Date().getFullYear();
  const years =
    BRAND.copyrightStartYear < now
      ? `${BRAND.copyrightStartYear}-${now}`
      : `${now}`;
  return `Copyright © ${years} ${BRAND.legalName}. All rights reserved.`;
}
