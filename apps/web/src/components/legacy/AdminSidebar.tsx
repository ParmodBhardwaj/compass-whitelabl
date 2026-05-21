'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch, clearTokens } from '@/lib/auth';

interface NavNode {
  id: number;
  parentId: number;
  title: string;
  routeName?: string | null;
  action?: string | null;
  iconClass?: string;
  ordering?: number;
  storeId: number;
  children?: NavNode[];
}

/**
 * Admin left sidebar. Loads its menu tree from the legacy `store_modules`
 * table — same source the PHP admin uses. The active portal (store) is read
 * from `sessionStorage.admin.storeId` (written by `AdminTopHeader`'s
 * "Select Portal" dropdown). Switching portals reloads the tree.
 */
export function AdminSidebar() {
  const path = usePathname();
  const [tree, setTree] = useState<NavNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const v = sessionStorage.getItem('admin.storeId');
    return v ? Number(v) : 1;
  });
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const loadTree = useCallback(async (sid: number) => {
    setLoading(true);
    try {
      const rows = await apiFetch<NavNode[]>(`/menus/admin/navigation?store=${sid}`);
      setTree(Array.isArray(rows) ? rows : []);
    } catch {
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { loadTree(storeId); }, [storeId, loadTree]);

  // Listen for portal switches from AdminTopHeader. The header writes
  // sessionStorage but also dispatches a custom event so we can re-fetch
  // without polling.
  useEffect(() => {
    function onPortalChange(e: Event) {
      const detail = (e as CustomEvent<{ storeId: number }>).detail;
      if (detail?.storeId) setStoreId(detail.storeId);
    }
    window.addEventListener('admin:portal-change', onPortalChange);
    return () => window.removeEventListener('admin:portal-change', onPortalChange);
  }, []);

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function isActive(routeName?: string | null) {
    if (!routeName || routeName === '#') return false;
    // Legacy route names like "lmcadmin/news" → match our /admin/news URL.
    const candidate = routeName.replace(/^lmcadmin\//, '/admin/').replace(/^lmcadmin$/, '/admin');
    return path === candidate || path.startsWith(candidate + '/');
  }

  /**
   * Legacy → new-portal route map.
   *
   * The legacy PHP routes use singular path segments like "lmcadmin/employee"
   * while our Next.js app uses pluralised folders like "/admin/employees".
   * This table maps the legacy `route_name` from `store_modules` to the URL
   * Next.js actually serves, so a single click in the sidebar lands on the
   * right page even when the directory names don't match 1:1.
   *
   * Every entry on the LEFT is the value stored in `store_modules.route_name`.
   * Every entry on the RIGHT is the URL path the user lands on.
   */
  const ROUTE_ALIASES: Record<string, string> = {
    'lmcadmin/employee':        '/admin/employees',
    'lmcadmin/banner':          '/admin/banners',
    // Activity Tracker — existing /admin/activity-tracker page has internal
    // tabs for Programs / Tasks / Reports, no separate sub-pages.
    'lmcadmin/atracker/programs':   '/admin/activity-tracker',
    'lmcadmin/atracker/tasks':      '/admin/activity-tracker',
    'lmcadmin/atracker/taskReport': '/admin/activity-tracker',
    // Guest House — single landing page with sub-views
    'lmcadmin/house-location':  '/admin/guest-house',
    'lmcadmin/guest-houses':    '/admin/guest-house',
    'lmcadmin/booking-list':    '/admin/guest-house',
    // Dashboard variants land at /admin root
    'lmcadmin/dashboard':       '/admin',
    'lmcadmin/aclcategory':     '/admin/acl?tab=categories',
    'lmcadmin/role':            '/admin/acl?tab=fixed-roles',
    'lmcadmin/roleSetting':     '/admin/acl?tab=auto-roles',
    // SOP Approval — both Section and Department flow through the existing
    // SOP Sections admin (same `sop_sections` table, type='ss&sc').
    'lmcadmin/sopApproval/section':     '/admin/sections',
    'lmcadmin/sop-approval/department': '/admin/sections',
    // REST API "Applications" admin reuses the API Users grid for now
    // (legacy splits "client app catalogue" vs "credentials" but the data
    //  lives in the same hero_api_users table).
    'lmcadmin/restapi':         '/admin/api/users',
    // ── Car Pool portal ─────────────────────────────────────────────────
    'lmcadmin/locations':       '/admin/cp/locations',
    // ── Sale/Rent portal ────────────────────────────────────────────────
    'lmcadmin/sales':           '/admin/sale-rent',
    'lmcadmin/salesCat':        '/admin/sale-rent/categories',
    'lmcadmin/rides':           '/admin/cp/rides',
    // Gallery categories handled by /admin/gallery
    'lmcadmin/galcategory':     '/admin/gallery',
    // ── Idea / HM3H portals ─────────────────────────────────────────────
    'lmcadmin/ideacontent':     '/admin/idea/content',
    'lmcadmin/ideabanner':      '/admin/idea',
    'lmcadmin/category':        '/admin/genre/default',
    // ── R&D portal ──────────────────────────────────────────────────────
    'lmcadmin/rnd/noticeBoard': '/admin/rnd/notices',
    'lmcadmin/joiners':         '/admin/rnd/joinees',
    'lmcadmin/competitor':      '/admin/rnd/competitor-products',
    'lmcadmin/rnd-setting':     '/admin/setting',
    // ── D&I portal ──────────────────────────────────────────────────────
    'lmcadmin/dni/event':       '/admin/dni/events',
    'lmcadmin/dni/newsletter':  '/admin/dni/newsletters',
    'lmcadmin/dni/initiative':  '/admin/dni/initiatives',
    'lmcadmin/dni/video':       '/admin/dni/videos',
    'lmcadmin/dni/featured':    '/admin/dni/featured',
    // ── Quality Alert portal ────────────────────────────────────────────
    'lmcadmin/qualityAlert/department':    '/admin/department',
    'lmcadmin/qualityAlert/subdepartment': '/admin/qa/subdepartments',
    'lmcadmin/qualityAlert/initiator':     '/admin/qa/initiators',
    'lmcadmin/qualityAlert/fiUsers':       '/admin/qa/fi-users',
    'lmcadmin/qualityAlert/section':       '/admin/sections',
    // ── OEE portal ──────────────────────────────────────────────────────
    'lmcadmin/oee/section':     '/admin/sections',
    'lmcadmin/oee/line':        '/admin/oee/lines',
    'lmcadmin/oee/group':       '/admin/oee/groups',
    'lmcadmin/oee/machine':     '/admin/oee/machines',
    'lmcadmin/oee/holiday':     '/admin/oee/holidays',
    'lmcadmin/oee/loss':        '/admin/oee/loss-categories',
    'lmcadmin/oee/bottleneck':  '/admin/oee/bottlenecks',
    'lmcadmin/oee/department':  '/admin/oee/departments',
    // ── Audit Tracker portal ────────────────────────────────────────────
    'lmcadmin/audit/team':      '/admin/audit/teams',
    'lmcadmin/audit/cutoffDate':'/admin/audit/cutoff-dates',
    // ── Tax (HM3H) ──────────────────────────────────────────────────────
    'lmcadmin/tax/faq':         '/admin/tax',
    'lmcadmin/tax/hyperlinks':  '/admin/tax',
    'lmcadmin/tax/documents':   '/admin/tax',
    // ── TPM portal ──────────────────────────────────────────────────────
    'lmcadmin/tpm/plant':             '/admin/tpm/plants',
    'lmcadmin/tpm/escalation':        '/admin/tpm/escalations',
    'lmcadmin/tpm/hazard':            '/admin/tpm/hazard-types',
    'lmcadmin/tpm/category':          '/admin/tpm/hazard-categories',
    'lmcadmin/tpm/subCategory':       '/admin/tpm/hazard-sub-categories',
    'lmcadmin/tpm/injury':            '/admin/tpm/injured-body-parts',
    'lmcadmin/tpm/subBodyPart':       '/admin/tpm/injured-sub-body-parts',
    'lmcadmin/tpm/injuryReason':      '/admin/tpm/injury-reasons',
    'lmcadmin/tpm/kaizen/pillar':     '/admin/tpm/kaizen/pillars',
    'lmcadmin/tpm/kaizen/loss':       '/admin/tpm/kaizen/losses',
    'lmcadmin/tpm/kaizen/machine':    '/admin/tpm/kaizen/machines',
    'lmcadmin/tpm/kaizen/section':    '/admin/tpm/kaizen/sections',
    'lmcadmin/tpm/kaizen/kaizenDepartment': '/admin/tpm/kaizen/plants',
    'lmcadmin/tpm/kaizen/unitMeasurement':  '/admin/tpm/kaizen/uoms',
    'lmcadmin/tpm/tagType':           '/admin/tpm/equipment-types',
    // ── Visitors portal ─────────────────────────────────────────────────
    'lmcadmin/visitors/locations':         '/admin/visitors/locations',
    'lmcadmin/visitors/instruction':       '/admin/visitors/instructions',
    'lmcadmin/visitors/approvalMembers':   '/admin/visitors/approval-members',
    'lmcadmin/visitors/disabledFields':    '/admin/visitors/disabled-fields',
    'lmcadmin/visitors/securityMembers':   '/admin/visitors/security-members',
    'lmcadmin/visitors/canteenMember':     '/admin/visitors/canteen-members',
    'lmcadmin/visitors/receptionMember':   '/admin/visitors/reception-members',
    'lmcadmin/visitors/feedbackLocationDepartment': '/admin/visitors/feedback-locations',
    'lmcadmin/visitors/question':          '/admin/visitors/feedback-questions',
    'lmcadmin/visitors/employeeQuestion':  '/admin/visitors/feedback-questions',
    'lmcadmin/visitors/visitorPass':       '/admin/visitors/pass-types',
    'lmcadmin/visitors/gradePassVisible':  '/admin/visitors/grades',
    // ── KPoint portal — every legacy /kpoint/<section> page is a CRUD over
    //    the same hero_kpoint_videos table filtered by section name. Map
    //    all of them to a single Video Catalog admin that takes the section
    //    via query string.
    'lmcadmin/kpoint/dashboard':            '/admin/kpoint/videos',
    'lmcadmin/kpoint/part':                 '/admin/kpoint/videos?section=part',
    'lmcadmin/kpoint/sstModel':             '/admin/kpoint/videos?section=sstModel',
    'lmcadmin/kpoint/country':              '/admin/kpoint/videos?section=country',
    'lmcadmin/kpoint/product':              '/admin/kpoint/videos?section=product',
    'lmcadmin/kpoint/language':             '/admin/kpoint/videos?section=language',
    'lmcadmin/kpoint/disclaimer':           '/admin/kpoint/videos?section=disclaimer',
    'lmcadmin/kpoint/question':             '/admin/kpoint/videos?section=question',
    'lmcadmin/kpoint/questionExcel':        '/admin/kpoint/videos?section=question',
    'lmcadmin/kpoint/globalUser':           '/admin/kpoint/videos?section=globalUser',
    'lmcadmin/kpoint/globalUserImport':     '/admin/kpoint/videos?section=globalUser',
    'lmcadmin/kpoint/pdf':                  '/admin/kpoint/videos?section=pdf',
    'lmcadmin/kpoint/pdfLink':              '/admin/kpoint/videos?section=pdfLink',
    'lmcadmin/kpoint/scheduledMaintenance': '/admin/kpoint/videos?section=scheduledMaintenance',
    'lmcadmin/kpoint/H100cc':               '/admin/kpoint/videos?section=100cc',
    'lmcadmin/kpoint/coreOne':              '/admin/kpoint/videos?section=coreOne',
    'lmcadmin/kpoint/coreTwo':              '/admin/kpoint/videos?section=coreTwo',
    'lmcadmin/kpoint/scooter':              '/admin/kpoint/videos?section=scooter',
    'lmcadmin/kpoint/brakes':               '/admin/kpoint/videos?section=brakes',
    'lmcadmin/kpoint/carburetor':           '/admin/kpoint/videos?section=carburetor',
    'lmcadmin/kpoint/electrical':           '/admin/kpoint/videos?section=electrical',
    'lmcadmin/kpoint/lubrication':          '/admin/kpoint/videos?section=lubrication',
    'lmcadmin/kpoint/suspension':           '/admin/kpoint/videos?section=suspension',
    'lmcadmin/kpoint/absTroubleshooting':   '/admin/kpoint/videos?section=absTroubleshooting',
    'lmcadmin/kpoint/xtremeCountermeasure': '/admin/kpoint/videos?section=xtremeCountermeasure',
    'lmcadmin/kpoint/ignitionSystemDiagnosisSop':     '/admin/kpoint/videos?section=ignitionSystem',
    'lmcadmin/kpoint/chargingSystemDiagnosisSop':     '/admin/kpoint/videos?section=chargingSystem',
    'lmcadmin/kpoint/startingSystemDiagnosisSop':     '/admin/kpoint/videos?section=startingSystem',
    'lmcadmin/kpoint/i3sSystemDiagnosisSop':          '/admin/kpoint/videos?section=i3sSystem',
    'lmcadmin/kpoint/clutchSystemDiagnosisSop':       '/admin/kpoint/videos?section=clutchSystem',
    'lmcadmin/kpoint/transmissionSystemDiagnosisSop': '/admin/kpoint/videos?section=transmissionSystem',
    'lmcadmin/kpoint/calBasedEcuFlashingOnline':      '/admin/kpoint/videos?section=calBasedEcuFlashingOnline',
    'lmcadmin/kpoint/calBasedEcuFlashingOffline':     '/admin/kpoint/videos?section=calBasedEcuFlashingOffline',
    'lmcadmin/kpoint/paintProtectionKit':             '/admin/kpoint/videos?section=paintProtectionKit',
    'lmcadmin/kpoint/reverseBrakeBleeding':           '/admin/kpoint/videos?section=reverseBrakeBleeding',
    'lmcadmin/kpoint/dryWash':                        '/admin/kpoint/videos?section=dryWash',
    'lmcadmin/kpoint/wetWash':                        '/admin/kpoint/videos?section=wetWash',
    'lmcadmin/kpoint/chainCleaningAndLubrication':    '/admin/kpoint/videos?section=chainCleaning',
    // ── TPM workflow pages — many alias to existing master pages ─────────
    'lmcadmin/tpm/plantApplications': '/admin/tpm/escalations',     // settings group
    'lmcadmin/tpm/listing':           '/admin/tpm/plants',
    'lmcadmin/tpm/master':            '/admin/tpm/plants',
    'lmcadmin/tpm/officer':           '/admin/tpm/safety-officers',
    'lmcadmin/tpm/adviser':           '/admin/tpm/medical-officers',
    'lmcadmin/tpm/hrOfficer':         '/admin/tpm/hr-officers',
    'lmcadmin/tpm/hazardOfficer':     '/admin/tpm/safety-officers',
    'lmcadmin/tpm/hazardRequest':     '/portal/tpm/hazard.html',
    'lmcadmin/tpm/injuryDepartment':  '/admin/department',
    'lmcadmin/tpm/injurySection':     '/admin/sections',
    'lmcadmin/tpm/injuryList':        '/portal/tpm.html',
    'lmcadmin/tpm/classification':    '/admin/tpm/classifications',
    'lmcadmin/tpm/equipment':         '/admin/tpm/equipment-types',
    'lmcadmin/tpm/equipmentListing':  '/admin/tpm/equipment-types',
    'lmcadmin/tpm/nonEquipment':      '/admin/tpm/equipment-types',
    'lmcadmin/tpm/tagList':           '/portal/tpm.html',
    'lmcadmin/tpm/pendingTag':        '/portal/tpm.html',
    'lmcadmin/tpm/nonStaff':          '/admin/tpm/non-staff',
    'lmcadmin/tpm/nonStaffListing':   '/admin/tpm/non-staff',
    'lmcadmin/tpm/kaizen/theme':      '/admin/tpm/kaizen/themes',
    'lmcadmin/tpm/kaizen/benefit':    '/admin/tpm/kaizen/benefits',
    'lmcadmin/tpm/kaizen/nonMachine': '/admin/tpm/kaizen/machines',
    'lmcadmin/tpm/kaizen/machineUpload': '/admin/tpm/kaizen/machines',
    // MP Sheet pillar/theme/topic etc. — all aliased to existing department / section admin
    'lmcadmin/tpm/pillar':            '/admin/tpm/kaizen/pillars',
    'lmcadmin/tpm/theme':             '/admin/tpm/kaizen/themes',
    'lmcadmin/tpm/topic':             '/admin/tpm/kaizen/topics',
    'lmcadmin/tpm/opexTeam':          '/admin/tpm/opex-team',
    'lmcadmin/tpm/department':        '/admin/department',
    'lmcadmin/tpm/section':           '/admin/sections',
    // ── OEE workflow pages — data-import + working-day reuse holidays page
    'lmcadmin/oee/excelUpload':         '/admin/oee/holidays',
    'lmcadmin/oee/sectionUpload':       '/admin/oee/holidays',
    'lmcadmin/oee/groupwiseDownload':   '/admin/oee/holidays',
    'lmcadmin/oee/mfgCoordinator':      '/admin/oee/mfg-coordinators',
    'lmcadmin/oee/businessExcellence':  '/admin/oee/business-excellence',
    'lmcadmin/oee/workingDay':          '/admin/oee/holidays',
    // ── Audit report routes — point to existing cutoff-dates page
    'lmcadmin/audit/cutoffDateReport':         '/admin/audit/cutoff-dates',
    'lmcadmin/audit/markedObservationReport':  '/admin/audit/cutoff-dates',
    // ── Quality Alert report — alias to portal quality-alert page
    'lmcadmin/qualityAlert/report':            '/portal/quality-alert',
    // ── KPoint dealers — alias to employees admin
    'lmcadmin/dealer':                 '/admin/employees',
    'lmcadmin/dealerRole':             '/admin/acl?tab=fixed-roles',
    // Tcg
    'lmcadmin/tcg/setting':            '/admin/setting',
  };

  function urlFor(node: NavNode) {
    const route = node.routeName ?? '';
    if (!route || route === '#') return '#';

    // Explicit alias takes priority.
    if (ROUTE_ALIASES[route]) return ROUTE_ALIASES[route];

    // Default: map "lmcadmin/<path>" → "/admin/<path>".
    let target = route.startsWith('lmcadmin/')
      ? '/' + route.replace(/^lmcadmin\//, 'admin/')
      : route.startsWith('/') ? route : '/' + route;
    if (node.action && node.action !== 'index') {
      target = target.replace(/\/$/, '') + '/' + node.action;
    }
    return target;
  }

  function renderNode(node: NavNode, depth = 0): React.ReactNode {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const open = expanded.has(node.id);
    const active = isActive(node.routeName);
    const icon = node.iconClass?.trim() || 'fa fa-circle-o';

    return (
      <li key={node.id} className={active ? 'active' : ''}>
        {hasChildren ? (
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); toggleExpand(node.id); }}
            style={{ paddingLeft: depth > 0 ? 40 : undefined }}
          >
            <i className={icon} style={{ marginRight: 8 }} />
            <span className="nav-label">{node.title}</span>
            <span className="fa arrow" style={{ float: 'right', marginTop: 2 }}>
              <i className={`fa fa-chevron-${open ? 'down' : 'right'}`} style={{ fontSize: 11 }} />
            </span>
          </a>
        ) : (
          <Link href={urlFor(node)} style={{ paddingLeft: depth > 0 ? 40 : undefined }}>
            <i className={icon} style={{ marginRight: 8 }} />
            <span className="nav-label">{node.title}</span>
          </Link>
        )}
        {hasChildren && open && (
          <ul className="nav nav-second-level collapse in">
            {node.children!.map(c => renderNode(c, depth + 1))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <nav className="navbar-default navbar-static-side" role="navigation">
      {/* Pinned logo */}
      <div className="admin-sidebar-logo">
        <img
          src="http://heronewlanding.local.com/frontend/img/logo.png"
          alt="Hero"
          style={{ height: 32 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div
          className="admin-sidebar-logo-text"
          style={{ marginTop: 6, color: '#a7b1c2', fontSize: 11, letterSpacing: 1 }}
        >
          ADMIN
        </div>
      </div>

      {/* Scrollable nav list */}
      <div className="admin-sidebar-scroll sidebar-collapse">
        <ul className="nav metismenu" id="side-menu">
          {/* Dashboard is always first — it lives at /admin (no route_name in
              store_modules can collide because we filter parent_id) */}
          <li className={path === '/admin' ? 'active' : ''}>
            <Link href="/admin">
              <i className="fa fa-th-large" style={{ marginRight: 8 }} />
              <span className="nav-label">Dashboard</span>
            </Link>
          </li>
          {loading ? (
            <li style={{ padding: '14px 20px', color: '#a7b1c2', fontSize: 12 }}>
              <i className="fa fa-spinner fa-spin" style={{ marginRight: 8 }} />Loading…
            </li>
          ) : tree.length === 0 ? (
            <li style={{ padding: '14px 20px', color: '#a7b1c2', fontSize: 12 }}>
              No admin modules for this portal.
            </li>
          ) : (
            tree.map(n => renderNode(n))
          )}
        </ul>
      </div>

      {/* Pinned log-out */}
      <div className="admin-sidebar-logout">
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            clearTokens();
            window.location.href = '/login';
          }}
        >
          <i className="fa fa-sign-out" style={{ marginRight: 8 }} />
          <span className="nav-label">Log out</span>
        </a>
      </div>
    </nav>
  );
}
