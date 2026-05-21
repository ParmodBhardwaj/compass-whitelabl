'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/auth';
import { withHtml } from '@/lib/portal-url';

type Tab = 'favorite' | 'recent' | 'most';

interface Item {
  id: number;
  title?: string;
  url?: string;
  menuId?: number;
  menu_id?: number;
}

/**
 * Right-column "MY APPLICATIONS" panel with Favorite / Recently Viewed /
 * Most Viewed tabs — pink rounded tiles matching the legacy portal.
 */
export function MyApplicationsPanel() {
  const [tab, setTab] = useState<Tab>('favorite');
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      try {
        let res: any;
        if (tab === 'favorite') res = await apiFetch('/favourites');
        else if (tab === 'recent') res = await apiFetch('/recent-views/recent?limit=12');
        else if (tab === 'most') res = await apiFetch('/recent-views/most-viewed?limit=12');
        setItems(Array.isArray(res) ? res : []);
      } catch {
        setItems([]);
      }
    })();
  }, [tab]);

  /** Best-effort label: use title, else derive from URL ("/portal/kpoint" → "kpoint"). */
  function labelFor(it: Item): string {
    if (it.title) return it.title;
    if (it.url) {
      const seg = it.url.split('/').filter(Boolean).pop() ?? '';
      return seg.replace(/[-_]/g, ' ');
    }
    return '(untitled)';
  }

  /** Truncate per spec: if total length > 15 chars, keep first 13 and append "..". */
  function clamp(s: string): string {
    return s.length > 15 ? s.slice(0, 13).trimEnd() + '..' : s;
  }

  return (
    <div
      className="ibox"
      style={{
        position: 'relative',
        // Fill the col-lg-3 column to match BannerCarousel height (~420px)
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginBottom: 0,
      }}
    >
      <div
        className="ibox-content"
        style={{
          borderRadius: 4,
          padding: '14px 14px 16px',
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <h4 style={{ marginTop: 0, marginBottom: 10, fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}>MY APPLICATIONS</h4>
        <ul style={{
          display: 'flex', flexWrap: 'nowrap', alignItems: 'center',
          listStyle: 'none', padding: 0, margin: '0 0 16px 0',
          borderBottom: '1px solid #e5e5e5', gap: 0,
        }}>
          <Tab id="favorite" active={tab} onClick={setTab}>Favorite</Tab>
          <Tab id="recent" active={tab} onClick={setTab}>Recently Viewed</Tab>
          <Tab id="most" active={tab} onClick={setTab}>Most Viewed</Tab>
        </ul>
        <div
          style={{
            display: 'grid',
            // 3 columns, auto rows that stretch to fill remaining flex space
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: '1fr',
            gap: 8,
            flex: '1 1 auto',
            minHeight: 0,
            alignContent: 'stretch',
          }}
        >
          {items.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9aa', fontSize: 12, padding: '12px 0' }}>
              No items yet.
            </div>
          ) : (
            items.slice(0, 12).map((it, i) => {
              const fullLabel = labelFor(it);
              return (
                <a
                  key={(it.id ?? i) + ':' + (it.title ?? '')}
                  href={withHtml(it.url)}
                  title={fullLabel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    background: '#fce4e4',
                    color: '#333',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: 6,
                    textDecoration: 'none',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    minWidth: 0,
                    minHeight: 0,
                    wordBreak: 'break-word',
                  } as React.CSSProperties}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', width: '100%' }}>
                    {clamp(fullLabel)}
                  </span>
                </a>
              );
            })
          )}
        </div>
      </div>
      {/* Floating red home-icon button (top-right edge, matches legacy) */}
      <a
        href="/portal"
        style={{
          position: 'absolute',
          top: 0,
          right: -22,
          width: 36,
          height: 36,
          background: '#e2231a',
          color: 'white',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '4px 4px 4px 0',
        }}
        aria-label="Home"
      >
        <i className="fa fa-home" />
      </a>
    </div>
  );
}

function Tab({ id, active, onClick, children }: { id: 'favorite' | 'recent' | 'most'; active: 'favorite' | 'recent' | 'most'; onClick: (t: any) => void; children: React.ReactNode }) {
  const isActive = active === id;
  return (
    <li style={{ flexShrink: 0, listStyle: 'none' }}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick(id);
        }}
        style={{
          display: 'block',
          fontSize: 11,
          padding: '6px 8px 6px 0',
          marginRight: 4,
          whiteSpace: 'nowrap',
          color: isActive ? '#e2231a' : '#676a6c',
          borderBottom: isActive ? '2px solid #e2231a' : '2px solid transparent',
          textDecoration: 'none',
          fontWeight: isActive ? 600 : 400,
        }}
      >
        {children}
      </a>
    </li>
  );
}

