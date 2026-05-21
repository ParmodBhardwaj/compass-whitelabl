'use client';
import { useEffect, useState } from 'react';
import { apiFetch, clearTokens } from '@/lib/auth';

interface Portal {
  storeId: number;
  name: string;
  alias?: string;
  frontendUrl?: string;
}

/**
 * Admin top header — matches the legacy PHP backend (/admin/dashboard).
 *
 * Layout (right-aligned, matching the legacy screenshot):
 *
 *   Select Portal  [ Main Portal ▾ ]     Back To Home Page      ⏻ Log out
 *
 * The "Select Portal" dropdown lets a super-admin switch between stores
 * (multi-tenant). In legacy this is backed by the `stores` table; for
 * Phase-1 there is only `store_id = 1` ("Main Portal") so the list defaults
 * to that single entry. Selecting a different portal sets a `?store=<id>`
 * cookie/URL parameter that the admin pages will honor as multi-store comes
 * online.
 */
export function AdminTopHeader() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [activePortal, setActivePortal] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const stored = sessionStorage.getItem('admin.storeId');
    return stored ? Number(stored) : 1;
  });
  const [loadingPortals, setLoadingPortals] = useState(true);

  /**
   * Load the portals this user has access to.
   * Backend rule (see AclService.listStoresForUser):
   *   • Super Admin (user_id=1 or role_id 9) sees every store
   *   • Other users see only stores reachable via acl_user → acl_store_roles
   * Falls back to a single "Main Portal" entry if the API errors so the UI
   * never breaks for unauthenticated calls or DB hiccups.
   */
  useEffect(() => {
    apiFetch<Portal[]>('/acl/stores/mine')
      .then((rows) => {
        const list = Array.isArray(rows) && rows.length > 0
          ? rows
          : [{ storeId: 1, name: 'Main Portal', alias: 'main' }];
        setPortals(list);
        // If the persisted activePortal is no longer accessible, reset to the
        // first store the user CAN see.
        if (!list.some((p) => p.storeId === activePortal)) {
          setActivePortal(list[0].storeId);
          try { sessionStorage.setItem('admin.storeId', String(list[0].storeId)); } catch {}
        }
      })
      .catch(() => {
        setPortals([{ storeId: 1, name: 'Main Portal', alias: 'main' }]);
      })
      .finally(() => setLoadingPortals(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleHamburger(e: React.MouseEvent) {
    e.preventDefault();
    document.body.classList.toggle('mini-navbar');
  }

  function logout(e: React.MouseEvent) {
    e.preventDefault();
    clearTokens();
    window.location.href = '/login';
  }

  function pickPortal(storeId: number) {
    const p = portals.find(pp => pp.storeId === storeId);
    if (!p) return;
    setActivePortal(storeId);
    try { sessionStorage.setItem('admin.storeId', String(storeId)); } catch {}
    // Notify the sidebar so it reloads its menu tree for the new portal,
    // mirroring legacy admin behavior where the left menu reloads on portal
    // change without a full page refresh.
    try {
      window.dispatchEvent(new CustomEvent('admin:portal-change', {
        detail: { storeId, alias: p.alias },
      }));
    } catch {}
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HEADER_CSS }} />
      <nav
        className="navbar navbar-static-top white-bg admin-topbar"
        role="navigation"
        style={{ marginBottom: 0, borderBottom: '1px solid #e7eaec' }}
      >
        {/* Left — hamburger */}
        <div className="navbar-header" style={{ display: 'flex', alignItems: 'center' }}>
          <a
            className="navbar-minimalize minimalize-styl-2 btn btn-primary"
            href="#"
            onClick={toggleHamburger}
            style={{ marginLeft: 4 }}
            title="Toggle sidebar"
          >
            <i className="fa fa-bars" />
          </a>
        </div>

        {/* Right — portal selector + back-home + logout */}
        <ul className="nav navbar-top-links navbar-right admin-topbar-actions">
          <li className="admin-portal-cell">
            <span className="admin-portal-label">Select Portal</span>
            <select
              className="admin-portal-select"
              value={activePortal}
              onChange={(e) => pickPortal(Number(e.target.value))}
              disabled={loadingPortals || portals.length === 0}
              aria-label="Select portal"
            >
              {loadingPortals && <option>Loading…</option>}
              {!loadingPortals && portals.map(p => (
                <option key={p.storeId} value={p.storeId}>
                  {p.name}
                </option>
              ))}
            </select>
          </li>

          <li>
            <a href="/portal" className="admin-back-link">
              Back To Home Page
            </a>
          </li>

          <li>
            <a href="/login" className="admin-logout-link" onClick={logout}>
              <i className="fa fa-sign-out" style={{ marginRight: 6 }} />
              Log out
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

const HEADER_CSS = `
  .admin-topbar {
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 16px;
    width: 100%;
  }
  .admin-topbar > .navbar-header {
    flex-shrink: 0;
    margin-right: auto;
  }
  .admin-topbar-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    padding: 0;
    margin-left: auto;
    float: none !important;
  }
  .admin-topbar-actions > li {
    list-style: none;
    display: flex;
    align-items: center;
    float: none !important;
  }
  .admin-portal-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 18px 0 8px;
    border-right: 1px solid #e7eaec;
    height: 42px;
  }
  .admin-portal-label {
    font-size: 13px;
    font-weight: 600;
    color: #444;
  }
  /* Native <select> styled to match the legacy admin "Select Portal" pill.
     Browsers render the popup in a single column with their native option
     list (white bg, blue highlight on the current selection) which is
     exactly the look in the legacy screenshot. */
  .admin-portal-select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    min-width: 170px;
    height: 32px;
    padding: 0 32px 0 14px;
    background-color: #1ab394;            /* Inspinia green */
    background-image:
      linear-gradient(45deg, transparent 50%, #ffffff 50%),
      linear-gradient(135deg, #ffffff 50%, transparent 50%);
    background-position:
      calc(100% - 16px) 14px,
      calc(100% - 11px) 14px;
    background-size:
      5px 5px,
      5px 5px;
    background-repeat: no-repeat;
    color: #fff;
    border: none;
    border-radius: 3px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s;
  }
  .admin-portal-select:hover:not(:disabled) { background-color: #18a689; }
  .admin-portal-select:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(26,179,148,0.3);
  }
  .admin-portal-select:disabled { opacity: 0.6; cursor: not-allowed; }
  /* Option list rendering — Chrome/Edge respect these to match legacy:
     white background panel, options highlight blue when hovered. */
  .admin-portal-select option {
    background: #ffffff;
    color: #444;
    padding: 6px 10px;
  }
  .admin-back-link {
    color: #1c84c6;          /* Inspinia info-blue */
    font-size: 13px;
    text-decoration: none;
    padding: 0 18px;
    border-right: 1px solid #e7eaec;
    height: 42px;
    display: inline-flex;
    align-items: center;
  }
  .admin-back-link:hover { color: #126596; }
  .admin-logout-link {
    color: #676a6c;
    font-size: 13px;
    text-decoration: none;
    padding: 0 14px;
    height: 42px;
    display: inline-flex;
    align-items: center;
  }
  .admin-logout-link:hover { color: #e2231a; }
`;
