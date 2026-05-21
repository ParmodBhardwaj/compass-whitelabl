'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { apiFetch, clearTokens } from '@/lib/auth';
import { resolveAvatar } from '@/lib/legacy-url';
import { withHtml, resolveMenuUrl } from '@/lib/portal-url';
import { BRAND } from '@/lib/brand';

interface MenuItem {
  id: number;
  menuName: string;
  url?: string;
  class?: string;         // FA icon class from DB e.g. "fa-home"
  ordering: number;
  parentId: number;
  active: '0' | '1';
  newWindow?: '0' | '1';
  children?: MenuItem[];
}

interface CurrentUser {
  id?: number;
  name?: string;
  email?: string;
  profilepic?: string;
  designation?: string;
  roles?: number[];
}

interface PortalLink {
  storeId: number;
  name: string;
  alias?: string;
  frontendUrl?: string;
}

/** Sensible default icon per portal alias, so the new "Portals" rail looks
 *  like the rest of the sidebar instead of generic dots. */
const PORTAL_ICONS: Record<string, string> = {
  main: 'fa-home',
  isportal: 'fa-shield',
  rides: 'fa-car',
  sales: 'fa-tag',
  idea: 'fa-lightbulb-o',
  rnd: 'fa-flask',
  kpoint: 'fa-play-circle',
  dni: 'fa-users',
  tpm: 'fa-wrench',
  audit: 'fa-clipboard',
  visitors: 'fa-id-card',
  oee: 'fa-bar-chart',
  hm3h: 'fa-cubes',
  'quality-alert': 'fa-exclamation-triangle',
  'mp-sheet': 'fa-th-list',
  tcg: 'fa-trophy',
};

/**
 * Map `acl_stores.alias` → the URL segment we use under `/portal/<segment>/...`.
 * The legacy `frontend_url` doesn't match our route segments 1:1 (e.g. legacy
 * `sales.html` is now `/portal/sale-rent`), so we keep an explicit map. Aliases
 * that aren't listed default to themselves (e.g. `visitors` → `visitors`).
 *
 * Used to detect which portal the current pathname is inside, so the sidebar
 * can swap its menu set to that portal — mirroring the legacy PHP behavior
 * where each portal renders only its own left-nav.
 */
const PORTAL_ALIAS_TO_SEGMENT: Record<string, string> = {
  main: '',                  // root portal (no subsegment)
  sales: 'sale-rent',
  rides: 'carpool',
  isportal: 'is-portal',
  'mp-sheet': 'mpsheet',
};

/**
 * Map legacy `frontend_url` → the URL segment we use under `/portal/<segment>/...`.
 * Mirrors the Next.js rewrites in next.config.mjs so this works even when a
 * user lands on a legacy `.html` URL.
 */
const LEGACY_URL_TO_SEGMENT: Record<string, string> = {
  '/': '',
  'sales.html': 'sale-rent',
  'rides.html': 'carpool',
  'is-portal.html': 'is-portal',
  'idea/ideas.html': 'idea',
  'rnd/rnd.html': 'rnd',
  'kpoint/kpoint.html': 'kpoint',
  'dni/dni.html': 'dni',
  'tpm/hazard.html': 'tpm',
  'audit/dashboard.html': 'audit',
  'visitors/home.html': 'visitors',
  'oee.html': 'oee',
  'hm3h/home.html': 'hm3h',
  'quality-alert/home.html': 'quality-alert',
  'mp-sheet/home.html': 'mpsheet',
  'tcg/tcg.html': 'tcg',
};

function portalSegmentForAlias(alias?: string): string {
  if (!alias) return '';
  if (alias in PORTAL_ALIAS_TO_SEGMENT) return PORTAL_ALIAS_TO_SEGMENT[alias];
  return alias;
}

/**
 * Role IDs (from `acl_roles`) that grant the legacy admin dashboard.
 * 9 = "Super Admin". Add more here if you want module-admin roles to also
 * see the Dashboard link (e.g. 52 = Audit Admin, 50 = TPM Admin).
 */
const ADMIN_ROLE_IDS: number[] = [9];

/**
 * Left sidebar — pixel-faithful replica of the legacy portal.
 *
 * Features:
 *   • User card (avatar, name, designation, logout)
 *   • "Search Apps" quick-filter input
 *   • App list from /v2/menus?position=1 with per-app icon (menu.class)
 *   • Submenus expand/collapse with chevron
 *   • ★ favourite toggle per item
 *   • Active route highlight
 *   • Mini-navbar collapse (body.mini-navbar) driven by TopHeader hamburger
 */
export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser>({});
  const [favIds, setFavIds] = useState<Set<number>>(new Set());
  const [tree, setTree] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [userOpen, setUserOpen] = useState(false);
  const [portals, setPortals] = useState<PortalLink[]>([]);
  const [portalsExpanded, setPortalsExpanded] = useState(true);

  /**
   * Compute the active portal's storeId from the current pathname + the list
   * of portals the user can access. Falls back to 1 (Main Portal).
   *
   * Match priority:
   *   1. New-style `/portal/<segment>` URLs — match against `PORTAL_ALIAS_TO_SEGMENT`.
   *   2. Legacy `.html` URLs that haven't yet been rewritten — match against
   *      the literal `frontend_url` value from `acl_stores`.
   *   3. `/admin/*` — admin dashboard, falls back to the same store the user
   *      last viewed (Main Portal by default).
   */
  const activeStoreId = useMemo<number>(() => {
    if (!portals.length) return 1;
    // Strip leading slash + trailing .html for matching.
    const p = pathname.replace(/^\/+/, '').replace(/\.html$/i, '');

    // 1. /portal/<segment>/... → match by alias segment
    if (p.startsWith('portal')) {
      const rest = p.slice('portal'.length).replace(/^\/+/, '');
      if (!rest) return 1; // /portal root → Main Portal
      const firstSeg = rest.split('/')[0];
      for (const port of portals) {
        const seg = portalSegmentForAlias(port.alias);
        if (seg && firstSeg === seg) return port.storeId;
      }
      return 1;
    }

    // 2. Legacy URL — match by frontend_url
    const fullLegacy = p + '.html'; // restore .html for table lookup
    const seg = LEGACY_URL_TO_SEGMENT[fullLegacy] ?? LEGACY_URL_TO_SEGMENT[p];
    if (seg !== undefined) {
      // We resolved a segment; now find the portal whose alias maps to it.
      for (const port of portals) {
        if (portalSegmentForAlias(port.alias) === seg) return port.storeId;
      }
    }

    // 3. Admin or unrecognized path → Main Portal default
    return 1;
  }, [pathname, portals]);

  /**
   * Active portal's URL segment (e.g. `visitors`, `tpm`). Empty string for
   * Main portal. Used to resolve relative menu URLs like `appointment.html`
   * → `/portal/visitors/appointment.html` (matches legacy PHP behavior).
   */
  const activePortalSegment = useMemo<string>(() => {
    const port = portals.find(p => p.storeId === activeStoreId);
    return portalSegmentForAlias(port?.alias);
  }, [portals, activeStoreId]);

  // Initial bootstrap: user + favourites + portals
  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<any>('/auth/me');
        setUser({
          id: me.id,
          name: me.name || me.displayName || me.fullName || me.empName || 'User',
          email: me.email,
          profilepic: me.profilepic ?? me.profilePic,
          designation: me.designation,
          roles: Array.isArray(me.roles) ? me.roles : [],
        });
      } catch {}
      try {
        const favs = await apiFetch<any[]>('/favourites');
        setFavIds(new Set(favs.map((f) => f.menuId ?? f.menu_id)));
      } catch {}
      try {
        // Portals the user has access to (per acl_user → acl_store_roles).
        // Same endpoint the admin "Select Portal" dropdown consumes.
        const ports = await apiFetch<PortalLink[]>('/acl/stores/mine');
        setPortals(Array.isArray(ports) ? ports : []);
      } catch { setPortals([]); }
    })();
  }, []);

  // Re-fetch menu tree whenever the active portal changes. This is what makes
  // the sidebar "portal-context aware" — opening the Visitor portal swaps the
  // sidebar to only show Visitor menu items, just like the legacy PHP.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const menuTree = await apiFetch<MenuItem[]>(`/menus?store=${activeStoreId}&position=1`);
        if (!cancelled) setTree(Array.isArray(menuTree) ? menuTree : []);
      } catch {
        if (!cancelled) setTree([]);
      }
    })();
    return () => { cancelled = true; };
  }, [activeStoreId]);

  /* Auto-expand parent of active child on first load */
  useEffect(() => {
    function findParent(items: MenuItem[], url: string): number | null {
      for (const it of items) {
        if (it.children?.some(c => c.url && pathname.startsWith(c.url))) return it.id;
        const deep = findParent(it.children ?? [], url);
        if (deep !== null) return deep;
      }
      return null;
    }
    const pid = findParent(tree, pathname);
    if (pid) setExpanded(prev => new Set([...prev, pid]));
  }, [tree, pathname]);

  async function toggleFav(e: React.MouseEvent, m: MenuItem) {
    e.preventDefault();
    e.stopPropagation();
    if (favIds.has(m.id)) {
      await apiFetch(`/favourites/by-menu/${m.id}`, { method: 'DELETE' }).catch(() => {});
      setFavIds(prev => { const n = new Set(prev); n.delete(m.id); return n; });
    } else {
      await apiFetch('/favourites', {
        method: 'POST',
        body: JSON.stringify({ title: m.menuName, url: resolveMenuUrl(m.url, activePortalSegment), menuId: m.id }),
      }).catch(() => {});
      setFavIds(prev => new Set([...prev, m.id]));
    }
  }

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function isActive(url?: string) {
    if (!url || url === '#') return false;
    // Compare against the portal-resolved .html URL so the active state still
    // matches when the address bar shows /portal/<portal>/foo.html.
    const target = resolveMenuUrl(url, activePortalSegment);
    if (target === '#') return false;
    // Strip .html suffix from both sides for tolerant matching.
    const stripHtml = (s: string) => s.replace(/\.html$/i, '');
    const a = stripHtml(pathname);
    const b = stripHtml(target);
    return a === b || a.startsWith(b + '/');
  }

  /* Filter flattens the tree to matching items when search is active */
  function filterTree(items: MenuItem[]): MenuItem[] {
    if (!filter.trim()) return items;
    const q = filter.toLowerCase();
    const out: MenuItem[] = [];
    function walk(list: MenuItem[]) {
      for (const it of list) {
        if (it.menuName.toLowerCase().includes(q)) out.push({ ...it, children: [] });
        if (it.children?.length) walk(it.children);
      }
    }
    walk(items);
    return out;
  }

  const displayed = filterTree(tree);

  /** Fire-and-forget tracking call so the menu shows up under "Recently Viewed" / "Most Viewed". */
  function trackView(m: MenuItem) {
    if (!m.url || m.url === '#') return;
    apiFetch('/recent-views/track', {
      method: 'POST',
      body: JSON.stringify({ menuId: m.id, url: resolveMenuUrl(m.url, activePortalSegment) }),
    }).catch(() => {});
  }

  function renderItem(m: MenuItem, depth = 0): React.ReactNode {
    const hasChildren = (m.children?.length ?? 0) > 0 && !filter.trim();
    const open = expanded.has(m.id);
    const active = isActive(m.url);
    const faved = favIds.has(m.id);
    const icon = m.class?.trim() || 'fa-th-large';

    return (
      <li key={m.id} className={active ? 'active' : ''}>
        <a
          href={hasChildren ? '#' : resolveMenuUrl(m.url, activePortalSegment)}
          target={m.newWindow === '1' ? '_blank' : undefined}
          rel={m.newWindow === '1' ? 'noreferrer' : undefined}
          onClick={hasChildren
            ? (e) => { e.preventDefault(); toggleExpand(m.id); }
            : () => { trackView(m); }
          }
          style={{ paddingLeft: depth > 0 ? 40 : undefined }}
        >
          <i className={`fa ${icon}`} />
          <span className="nav-label">{m.menuName}</span>
          {hasChildren && (
            <span className="fa arrow" style={{ float: 'right', marginTop: 2 }}>
              <i className={`fa fa-chevron-${open ? 'down' : 'right'}`} style={{ fontSize: 11 }} />
            </span>
          )}
          {!hasChildren && (
            <i
              className={`fa fa-star${faved ? '' : '-o'}`}
              onClick={(e) => toggleFav(e, m)}
              style={{
                float: 'right',
                marginTop: 2,
                color: faved ? '#f1c40f' : '#5d6778',
                cursor: 'pointer',
                fontSize: 13,
              }}
              title={faved ? 'Remove from favourites' : 'Add to favourites'}
            />
          )}
        </a>
        {hasChildren && open && (
          <ul className="nav nav-second-level collapse in">
            {m.children!.map(c => renderItem(c, depth + 1))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <nav className="navbar-default nav-bar-custom navbar-static-side" role="navigation">
      <style>{`
        .navbar-default.nav-bar-custom .nav > li:not(.nav-header):not(.profile-item):not(.menu-separator) > a:hover,
        .navbar-default.nav-bar-custom .nav > li:not(.nav-header):not(.profile-item):not(.menu-separator) > a:focus {
          background-color: #e6242c;
          color: white;
        }
        .navbar-default.nav-bar-custom .nav > li.nav-header a:hover,
        .navbar-default.nav-bar-custom .nav > li.nav-header a:focus,
        .navbar-default.nav-bar-custom .nav > li.profile-item a:hover,
        .navbar-default.nav-bar-custom .nav > li.profile-item a:focus {
          background-color: transparent !important;
          color: inherit;
        }
        /* Force logo li to flex so height/centering works despite Bootstrap */
        .nav-bar-custom #side-menu > li.logo-item {
          display: flex !important;
          align-items: center;
          justify-content: center;
          height: 60px;
          padding: 0 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        /* Profile card li — no nav-header interference */
        .nav-bar-custom #side-menu > li.profile-item {
          display: block !important;
          padding: 12px 20px 8px !important;
          margin: 0 !important;
          line-height: normal !important;
        }
        /* Separator — zero height, just the rule line */
        .nav-bar-custom #side-menu > li.menu-separator {
          display: block !important;
          padding: 0 !important;
          margin: 0 16px 4px !important;
          line-height: 0 !important;
          height: 1px !important;
          border-top: 1px solid rgba(255,255,255,0.12);
          overflow: hidden;
        }

        /* ── Sidebar scroll — pixel-faithful to legacy /admin/dashboard ──
           Pin the nav to the full viewport height, then scroll the menu list
           inside it. Without this, ~25+ menu items (Audit Tracker onwards)
           clip off the bottom of the page. */
        .navbar-default.nav-bar-custom.navbar-static-side {
          position: fixed !important;
          top: 0;
          bottom: 0;
          left: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 2;
        }
        .navbar-default.nav-bar-custom .sidebar-collapse {
          flex: 1 1 auto;
          overflow-y: auto;
          overflow-x: hidden;
          /* Firefox + WebKit thin scrollbar that fades into the panel until hover */
          scrollbar-width: thin;
          scrollbar-color: rgba(0,0,0,0.18) transparent;
        }
        .navbar-default.nav-bar-custom .sidebar-collapse::-webkit-scrollbar {
          width: 8px;
        }
        .navbar-default.nav-bar-custom .sidebar-collapse::-webkit-scrollbar-track {
          background: transparent;
        }
        .navbar-default.nav-bar-custom .sidebar-collapse::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 4px;
        }
        .navbar-default.nav-bar-custom .sidebar-collapse:hover::-webkit-scrollbar-thumb {
          background: rgba(226, 35, 26, 0.55);
        }
        /* Mini-navbar (collapsed) mode — sidebar shrinks but still scrolls */
        body.mini-navbar .navbar-default.nav-bar-custom.navbar-static-side {
          width: 70px;
        }
      `}</style>
      <div className="sidebar-collapse">
        <ul className="nav metismenu" id="side-menu">

          {/* ── Logo ─────────────────────────────────────────────────────────── */}
          <li className="nav-header logo-item">
            <a href="/portal" style={{ display: 'inline-block', lineHeight: 0 }}>
              <img
                src={BRAND.logoUrl}
                alt={BRAND.name}
                style={{ height: 40, maxWidth: 160, objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </a>
          </li>

          {/* ── User / profile header ─────────────────────────────────────────── */}
          <li className="profile-item">
            <div className={`dropdown profile-element${userOpen ? ' open' : ''}`}>
              <a
                href="#"
                className="dropdown-toggle"
                onClick={(e) => { e.preventDefault(); setUserOpen(o => !o); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
              >
                <img
                  alt="avatar"
                  className="img-circle"
                  src={resolveAvatar(user.profilepic)}
                  style={{ width: 48, height: 48, objectFit: 'cover', flexShrink: 0, borderRadius: '50%' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/img/profile.png';
                  }}
                />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: 13, color: '#000', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name ?? 'User'}
                  </strong>
                  {user.designation && (
                    <span style={{ display: 'block', fontSize: 11, color: '#a7b1c2', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.designation}
                    </span>
                  )}
                  <i className="fa fa-caret-down" style={{ color: '#a7b1c2', fontSize: 11, marginTop: 3, display: 'block' }} />
                </span>
              </a>
              {userOpen && (() => {
                // Admin = super-admin user_id (1) OR holds any whitelisted admin role.
                const isAdmin = user.id === 1
                  || (user.roles ?? []).some(r => ADMIN_ROLE_IDS.includes(r));
                return (
                  <ul className="dropdown-menu animated fadeInRight m-t-xs" style={{ top: 60, left: 10 }}>
                    <li>
                      <a href="/portal/profile">
                        <i className="fa fa-user" style={{ marginRight: 8 }} />My Profile
                      </a>
                    </li>
                    {isAdmin && (
                      <li>
                        <a href="/admin">
                          <i className="fa fa-tachometer" style={{ marginRight: 8 }} />Dashboard
                        </a>
                      </li>
                    )}
                    <li className="divider" />
                    <li>
                      <a
                        href="/login"
                        onClick={(e) => { e.preventDefault(); clearTokens(); window.location.href = '/login'; }}
                      >
                        <i className="fa fa-sign-out" style={{ marginRight: 8 }} />Log out
                      </a>
                    </li>
                  </ul>
                );
              })()}
            </div>
            {/* Mini-navbar mode initial */}
            <div className="logo-element">HC</div>
          </li>

          {/* ── Gap separator between profile and menu items ──────────────────── */}
          <li className="menu-separator" />

          {/* ── PORTALS rail ────────────────────────────────────────────────────
              Every portal (acl_stores) the user can access, listed at the top.
              Click → loads /portal{frontend_url}.html. The existing dynamic
              menu items render BELOW this rail, as requested. */}
          {portals.length > 0 && (
            <>
              <li className="portals-section-header">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPortalsExpanded(o => !o); }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <i className="fa fa-th-large" style={{ marginRight: 8 }} />
                  <span className="nav-label" style={{ flex: 1, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                    Portals
                  </span>
                  <i className={`fa fa-chevron-${portalsExpanded ? 'down' : 'right'}`} style={{ fontSize: 10, opacity: 0.6 }} />
                </a>
              </li>
              {portalsExpanded && portals.map(p => {
                const icon = PORTAL_ICONS[p.alias ?? ''] ?? 'fa-th-large';
                const url = p.frontendUrl
                  ? (p.frontendUrl.startsWith('http') ? p.frontendUrl : withHtml('/' + p.frontendUrl.replace(/^\/+/, '')))
                  : '#';
                // Active = this is the portal whose menus the sidebar is
                // currently rendering. This stays in lock-step with the menu
                // tree below, so the highlighted portal always matches the
                // visible menu set.
                const active = p.storeId === activeStoreId;
                return (
                  <li key={p.storeId} className={active ? 'active portal-link-item' : 'portal-link-item'}>
                    <a href={url}>
                      <i className={`fa ${icon}`} />
                      <span className="nav-label">{p.name}</span>
                    </a>
                  </li>
                );
              })}
              {/* Divider between portals rail and the legacy menu items */}
              <li className="menu-separator" />
            </>
          )}

          {/* ── Active portal label ──────────────────────────────────────────
              Shows the name of the portal whose menus are currently rendered.
              Mirrors the legacy PHP behavior where the heading at the top of
              each portal's sidebar shows the portal name. */}
          {(() => {
            const activePortal = portals.find(p => p.storeId === activeStoreId);
            if (!activePortal) return null;
            return (
              <li className="portal-context-header" style={{
                padding: '8px 20px 4px',
                fontSize: 11,
                color: '#a7b1c2',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                fontWeight: 700,
                listStyle: 'none',
              }}>
                <i className={`fa ${PORTAL_ICONS[activePortal.alias ?? ''] ?? 'fa-th-large'}`}
                  style={{ marginRight: 6, fontSize: 11, opacity: 0.7 }} />
                {activePortal.name} Menu
              </li>
            );
          })()}

          {/* ── Menu items (legacy menu table, position=1) ───────────────────── */}
          {displayed.map(m => renderItem(m))}

          {/* ── Empty-state for portals with no menus configured ─────────── */}
          {displayed.length === 0 && (
            <li style={{ padding: '20px', textAlign: 'center', color: '#5d6778', fontSize: 12 }}>
              <i className="fa fa-info-circle" style={{ marginRight: 6, opacity: 0.5 }} />
              No menu items configured for this portal.
            </li>
          )}

        </ul>
      </div>
    </nav>
  );
}
