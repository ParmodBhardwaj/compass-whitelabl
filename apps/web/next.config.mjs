/** @type {import('next').NextConfig} */
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

/**
 * Legacy PHP server — serves uploaded/media files.
 * In the strangler pattern this is Apache/Nginx on :8080 still running the
 * old Laminas app. All binary assets (images, PDFs, etc.) continue to live
 * there; we just proxy /files/* → legacy /uploads/*.
 * Override with LEGACY_URL in .env.local when the legacy server is elsewhere.
 */
const legacyBase = process.env.LEGACY_URL ?? 'http://localhost:8080';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // BFF: forward /api/v2/* to NestJS API
      { source: '/api/v2/:path*', destination: `${apiBase}/v2/:path*` },

      // File proxy: /files/<prefix>/<filename> → legacy /uploads/<prefix>/<filename>
      // e.g. /files/banners/slide.jpg  →  http://localhost:8080/uploads/banners/slide.jpg
      {
        source: '/files/:path*',
        destination: `${legacyBase}/uploads/:path*`,
      },

      // Legacy ".html" URL compatibility — every portal route can be accessed
      // with or without a trailing .html. This matches PHP behavior where
      // every page rendered as /portal/<alias>.html.
      // Server-internal rewrite: URL bar keeps the .html, page resolves normally.
      // Multi-segment example: /portal/tpm/hazard.html  →  /portal/tpm/hazard
      { source: '/portal/:path*.html', destination: '/portal/:path*' },
      { source: '/admin/:path*.html', destination: '/admin/:path*' },

      // ── Visitor admin: legacy camelCase URLs from `store_modules` →
      //    our kebab-case Next.js pages. So the AdminSidebar menu items
      //    (rendered from the DB) navigate to the right page.
      { source: '/admin/visitors/instruction',                destination: '/admin/visitors/instructions' },
      { source: '/admin/visitors/approvalMembers',            destination: '/admin/visitors/approval-members' },
      { source: '/admin/visitors/disabledFields',             destination: '/admin/visitors/disabled-fields' },
      { source: '/admin/visitors/securityMembers',            destination: '/admin/visitors/security-members' },
      { source: '/admin/visitors/canteenMember',              destination: '/admin/visitors/canteen-members' },
      { source: '/admin/visitors/receptionMember',            destination: '/admin/visitors/reception-members' },
      { source: '/admin/visitors/feedbackLocationDepartment', destination: '/admin/visitors/feedback-locations' },
      { source: '/admin/visitors/question',                   destination: '/admin/visitors/feedback-questions' },
      { source: '/admin/visitors/visitorPass',                destination: '/admin/visitors/pass-types' },
      { source: '/admin/visitors/gradePassVisible',           destination: '/admin/visitors/grades' },
      { source: '/admin/visitors/employeeQuestion',           destination: '/admin/visitors/employee-feedback-questions' },

      // ── Legacy portal frontend_url rewrites ────────────────────────────
      // Every row in `acl_stores.frontend_url` is the URL that PHP serves
      // at the root for that portal. We rewrite each one to its Next.js
      // /portal/... equivalent so legacy bookmarks + emails keep working.
      { source: '/sales.html',              destination: '/portal/sale-rent' },
      { source: '/rides.html',              destination: '/portal/carpool' },
      { source: '/is-portal.html',          destination: '/portal/is-portal' },
      { source: '/rnd/rnd.html',            destination: '/portal/rnd' },
      { source: '/dni/dni.html',            destination: '/portal/dni' },
      { source: '/kpoint/kpoint.html',      destination: '/portal/kpoint' },
      { source: '/tpm/hazard.html',         destination: '/portal/tpm/hazard' },
      { source: '/audit/dashboard.html',    destination: '/portal/audit' },
      { source: '/visitors/home.html',                       destination: '/portal/visitors' },

      // Visitor module — sub-page parity with legacy /visitors/*.html.
      // Top-level legacy URLs (no /portal/ prefix) → dedicated portal pages.
      { source: '/visitors/visitor-request.html',            destination: '/portal/visitors' },
      { source: '/visitors/appointment.html',                destination: '/portal/visitors/appointment' },
      { source: '/visitors/appointment/add.html',            destination: '/portal/visitors/appointment/add' },
      { source: '/visitors/appointment-status.html',         destination: '/portal/visitors/appointment-status' },
      { source: '/visitors/visitor-appointment-status.html', destination: '/portal/visitors/appointment-status' },
      { source: '/visitors/employee-approval.html',          destination: '/portal/visitors/employee-approval' },
      { source: '/visitors/checkout-pending.html',           destination: '/portal/visitors/checkout-pending' },
      { source: '/visitors/frequent-visitor.html',           destination: '/portal/visitors/frequent' },
      { source: '/visitors/pending-employee-feedback.html',  destination: '/portal/visitors/feedback' },
      { source: '/visitors/visitor-pass.html',               destination: '/portal/visitors' },

      // ── Sidebar-menu URL parity for Visitor portal ────────────────────
      // The legacy `menu.url` values for store=13 use names that don't 1:1
      // match our new portal pages. The sidebar resolver produces
      // /portal/visitors/<legacy-url> for those — route each to its closest
      // page. (The four new dedicated pages already live at their natural
      // paths, so no rewrites are needed for them.)
      { source: '/portal/visitors/function-report',                 destination: '/portal/visitors/feedback' },
      { source: '/portal/visitors/employee-feedback-report',        destination: '/portal/visitors/feedback' },
      { source: '/portal/visitors/overall-feedback-report',         destination: '/portal/visitors/feedback' },
      { source: '/portal/visitors/pending-employee-feedback-report', destination: '/portal/visitors/feedback' },
      { source: '/portal/visitors/feedback-report',                 destination: '/portal/visitors/feedback' },
      { source: '/portal/visitors/location-approval-members',       destination: '/portal/visitors' },
      { source: '/portal/visitors/location-dept-report',            destination: '/portal/visitors' },
      { source: '/portal/visitors/frequent-visitor',                destination: '/portal/visitors/frequent' },
      { source: '/portal/visitors/pending-request-report',          destination: '/portal/visitors' },
      { source: '/portal/visitors/pending-checkout-report',         destination: '/portal/visitors' },
      { source: '/hm3h/home.html',          destination: '/portal/hm3h' },
      { source: '/quality-alert/home.html', destination: '/portal/quality-alert' },
      { source: '/mp-sheet/home.html',      destination: '/portal/mpsheet' },
      { source: '/tcg/tcg.html',            destination: '/portal/tcg' },
      // Optional aliases — legacy idea + oee landings at the root.
      { source: '/idea/ideas.html',         destination: '/portal/idea' },
      { source: '/oee.html',                destination: '/portal/oee' },
    ];
  },
};

export default nextConfig;
