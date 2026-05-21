'use client';
import { useState, useEffect, useRef } from 'react';
import { clearTokens, apiFetch } from '@/lib/auth';
import { withHtml } from '@/lib/portal-url';
import { resolveAvatar } from '@/lib/legacy-url';

interface MenuItem {
  id: number;
  menuName: string;
  url?: string;
  ordering: number;
  parentId: number;
  active: '0' | '1';
  children?: MenuItem[];
}

interface FavouriteRow {
  id: number;
  title?: string;
  url?: string;
  menuId?: number;
  menu_id?: number;
}

/**
 * Top navigation bar — pixel-faithful replica of the legacy portal header.
 *
 * Features:
 *   • Logo + hamburger sidebar toggle
 *   • Global search → /portal/search?q=...
 *   • Dynamic dropdowns from /v2/menus?store=1&position=0 (header position)
 *   • Per-item ★ favourite toggle on every leaf menu (no children) — both
 *     top-level leaves and dropdown children. Matches legacy PHP behavior:
 *     `if (!$this->hasChildMenu($menu->id)) { ...show star... }`
 *   • Logout icon
 */
interface QuickEmployee {
  id: number;
  name: string;
  email?: string;
  ecode?: string;
  designation?: string;
  profilepic?: string;
}
interface QuickApp {
  id: number;
  title: string;
  url: string;
  icon?: string;
  kind: string;
}
interface QuickResult {
  employees: QuickEmployee[];
  applications: QuickApp[];
}

export function TopHeader() {
  const [q, setQ] = useState('');
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [favIds, setFavIds] = useState<Set<number>>(new Set());
  const navRef = useRef<HTMLUListElement>(null);

  // ── Live search state ──
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [quick, setQuick] = useState<QuickResult>({ employees: [], applications: [] });
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<MenuItem[]>('/menus?store=1&position=0')
      .then(data => setMenus(Array.isArray(data) ? data : []))
      .catch(() => {});

    // Load the user's favourites so we can render filled vs. empty stars.
    apiFetch<FavouriteRow[]>('/favourites')
      .then(rows => setFavIds(new Set((rows ?? []).map(f => f.menuId ?? f.menu_id ?? 0).filter(Boolean))))
      .catch(() => {});
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenId(null);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Debounced live search — fires `/v2/search/quick?q=...` as user types. */
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setQuick({ employees: [], applications: [] });
      setSearchOpen(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const r = await apiFetch<QuickResult>(`/search/quick?q=${encodeURIComponent(term)}`);
        setQuick(r ?? { employees: [], applications: [] });
        setSearchOpen(true);
      } catch {
        setQuick({ employees: [], applications: [] });
      } finally {
        setSearching(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) window.location.href = `/portal/search?q=${encodeURIComponent(term)}`;
  }

  function toggleHamburger(e: React.MouseEvent) {
    e.preventDefault();
    document.body.classList.toggle('mini-navbar');
  }

  /**
   * Add or remove a header-menu favourite. Stops propagation so clicking the
   * star never navigates or toggles a dropdown.
   */
  async function toggleFav(e: React.MouseEvent, m: MenuItem) {
    e.preventDefault();
    e.stopPropagation();
    if (favIds.has(m.id)) {
      await apiFetch(`/favourites/by-menu/${m.id}`, { method: 'DELETE' }).catch(() => {});
      setFavIds(prev => { const n = new Set(prev); n.delete(m.id); return n; });
    } else {
      await apiFetch('/favourites', {
        method: 'POST',
        body: JSON.stringify({ title: m.menuName, url: m.url ?? '#', menuId: m.id }),
      }).catch(() => {});
      setFavIds(prev => new Set([...prev, m.id]));
    }
  }

  /** Star icon for a leaf menu item — filled if favourited, hollow otherwise. */
  function StarIcon({ item, color = '#5d6778' }: { item: MenuItem; color?: string }) {
    const faved = favIds.has(item.id);
    return (
      <i
        className={`fa fa-star${faved ? '' : '-o'}`}
        role="button"
        aria-label={faved ? 'Remove from favourites' : 'Add to favourites'}
        title={faved ? 'Remove from favourites' : 'Add to favourites'}
        onClick={(e) => toggleFav(e, item)}
        style={{
          marginLeft: 8,
          color: faved ? '#f1c40f' : color,
          cursor: 'pointer',
          fontSize: 12,
          verticalAlign: 'middle',
        }}
      />
    );
  }

  return (
    <nav
      className="navbar navbar-static-top white-bg"
      role="navigation"
      style={{ marginBottom: 0, borderBottom: '1px solid #e7eaec' }}
    >
      {/* ── Left: logo + hamburger + search ──────────────────────────────── */}
      <div className="navbar-header" style={{ display: 'flex', alignItems: 'center' }}>
        {/* Hamburger / sidebar toggle */}
        <a
          className="navbar-minimalize minimalize-styl-2 btn btn-primary"
          href="#"
          onClick={toggleHamburger}
          style={{ marginLeft: 4 }}
        >
          <i className="fa fa-bars" />
        </a>

        {/* Global search — live two-column dropdown (Employees + Applications) */}
        <div
          ref={searchWrapRef}
          className="navbar-form-custom"
          style={{ flex: 1, position: 'relative' }}
        >
          <form role="search" onSubmit={handleSearch}>
            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="text"
                placeholder="Search here..."
                className="form-control"
                name="top-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => { if (q.trim().length >= 2) setSearchOpen(true); }}
                autoComplete="off"
                style={{ width: '100%', maxWidth: 440 }}
              />
            </div>
          </form>
          {searchOpen && q.trim().length >= 2 && (
            <SearchDropdown
              q={q}
              loading={searching}
              employees={quick.employees}
              applications={quick.applications}
              onClose={() => setSearchOpen(false)}
            />
          )}
        </div>
      </div>

      {/* ── Right: dynamic dropdowns ────────────────────────────────────── */}
      <ul className="nav navbar-top-links navbar-right" ref={navRef}>

        {/* Dynamic header menus from DB (e.g. Corporate ▾, Portals ▾) */}
        {menus.map(item => {
          const children = item.children ?? [];
          if (children.length > 0) {
            const isOpen = openId === item.id;
            return (
              <li key={item.id} className={`dropdown${isOpen ? ' open' : ''}`}>
                <a
                  className="dropdown-toggle count-info"
                  href="#"
                  onClick={(e) => { e.preventDefault(); setOpenId(isOpen ? null : item.id); }}
                >
                  {item.menuName}&nbsp;<i className="fa fa-caret-down" />
                </a>
                {isOpen && (
                  <ul
                    className="dropdown-menu dropdown-alerts"
                    style={{ right: 0, left: 'auto', minWidth: 220 }}
                  >
                    {children.map(c => (
                      <li key={c.id}>
                        <a
                          href={withHtml(c.url)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            padding: '8px 14px',
                          }}
                        >
                          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.menuName}
                          </span>
                          <StarIcon item={c} />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          }
          // Top-level leaf — star sits inline next to the label.
          return (
            <li key={item.id}>
              <a
                href={withHtml(item.url)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <span>{item.menuName}</span>
                <StarIcon item={item} color="#a0a8b3" />
              </a>
            </li>
          );
        })}

        {/* Logout */}
        <li>
          <a
            href="/login"
            title="Log out"
            style={{ padding: '16px 14px' }}
            onClick={(e) => { e.preventDefault(); clearTokens(); window.location.href = '/login'; }}
          >
            <i className="fa fa-power-off" style={{ fontSize: 16 }} />
          </a>
        </li>
      </ul>
    </nav>
  );
}

/**
 * Two-column live-search dropdown — legacy `/admin/search` parity.
 * Left: Employee List with avatar, name, email.
 * Right: Application Links — matching menus, CMS pages, news, activities.
 */
function SearchDropdown({
  q, loading, employees, applications, onClose,
}: {
  q: string;
  loading: boolean;
  employees: QuickEmployee[];
  applications: QuickApp[];
  onClose: () => void;
}) {
  const hasResults = employees.length > 0 || applications.length > 0;
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% - 4px)',
        left: 0,
        right: 0,
        maxWidth: 880,
        backgroundColor: '#ffffff',
        border: '1px solid #e7eaec',
        borderTop: '2px solid #e2231a',
        borderRadius: '0 0 4px 4px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        zIndex: 1000,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 120,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Left column — Employee List */}
      <div style={{ borderRight: '1px solid #e7eaec', backgroundColor: '#ffffff' }}>
        <div style={ddHeader}>Employee List</div>
        {loading && employees.length === 0 ? (
          <div style={ddEmpty}><i className="fa fa-spinner fa-spin" /> Searching…</div>
        ) : employees.length === 0 ? (
          <div style={ddEmpty}>No matching employees.</div>
        ) : employees.map(e => (
          <a
            key={e.id}
            href={e.email ? `mailto:${e.email}` : '#'}
            style={ddRow}
            onClick={() => onClose()}
          >
            {e.profilepic ? (
              <img
                src={resolveAvatar(e.profilepic)}
                alt=""
                style={ddAvatar}
                onError={(ev) => { (ev.target as HTMLImageElement).src = '/img/profile.png'; }}
              />
            ) : (
              <div style={{ ...ddAvatar, background: '#e7eaec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                <i className="fa fa-user" />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
              <div style={{ fontSize: 11, color: '#1c84c6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.email ?? ''}</div>
              {e.designation && (
                <div style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.designation}</div>
              )}
            </div>
          </a>
        ))}
      </div>

      {/* Right column — Application Links */}
      <div style={{ backgroundColor: '#ffffff' }}>
        <div style={ddHeader}>Application Links</div>
        {loading && applications.length === 0 ? (
          <div style={ddEmpty}><i className="fa fa-spinner fa-spin" /> Searching…</div>
        ) : applications.length === 0 ? (
          <div style={ddEmpty}>No matching applications.</div>
        ) : applications.map(a => (
          <a
            key={`${a.kind}-${a.id}`}
            href={a.url && a.url !== '#' ? withHtml(a.url) : '#'}
            style={{ ...ddRow, color: '#1c84c6' }}
            onClick={() => onClose()}
          >
            {a.icon && <i className={`fa ${a.icon}`} style={{ marginRight: 10, color: '#888', width: 16 }} />}
            <span style={{ fontSize: 13, flex: 1, color: '#1c84c6' }}>{a.title}</span>
          </a>
        ))}
      </div>

      {/* Bottom strip — "see all" link */}
      {hasResults && (
        <div style={{
          gridColumn: '1 / -1',
          borderTop: '1px solid #f4f4f4',
          padding: '8px 16px',
          textAlign: 'right',
          fontSize: 12,
          backgroundColor: '#ffffff',
        }}>
          <a
            href={`/portal/search?q=${encodeURIComponent(q)}`}
            style={{ color: '#e2231a', fontWeight: 600 }}
            onClick={() => onClose()}
          >
            See all results for "{q}" →
          </a>
        </div>
      )}
    </div>
  );
}

const ddHeader: React.CSSProperties = {
  background: '#a0a4ab',
  color: '#fff',
  padding: '10px 16px',
  fontWeight: 600,
  fontSize: 13,
  textAlign: 'center',
  letterSpacing: 0.3,
};
const ddRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 14px',
  borderBottom: '1px solid #f4f4f4',
  textDecoration: 'none',
  color: '#333',
  gap: 12,
};
const ddAvatar: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  objectFit: 'cover', flexShrink: 0, border: '1px solid #eee',
};
const ddEmpty: React.CSSProperties = {
  padding: '20px 16px', textAlign: 'center', fontSize: 12, color: '#aaa',
};
