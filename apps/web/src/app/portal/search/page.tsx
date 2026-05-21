'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

type SearchHit = {
  kind: 'page' | 'news' | 'gallery' | 'menu' | 'activity' | 'policy';
  id: number;
  title?: string;
  url?: string;
  snippet?: string;
};

const KIND_META: Record<string, { icon: string; label: string; color: string }> = {
  news:     { icon: 'fa-newspaper-o', label: 'News',       color: '#1c84c6' },
  page:     { icon: 'fa-file-text-o', label: 'Pages',      color: '#23c6c8' },
  gallery:  { icon: 'fa-picture-o',   label: 'Gallery',    color: '#f8ac59' },
  menu:     { icon: 'fa-bars',        label: 'Apps / Menu',color: '#1ab394' },
  activity: { icon: 'fa-calendar',    label: 'Activities', color: '#7266ba' },
  policy:   { icon: 'fa-shield',      label: 'Policies',   color: '#ed5565' },
};

export default function SearchPage() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setHits([]); setDone(false); return; }
    setLoading(true);
    setDone(false);
    apiFetch<SearchHit[]>(`/search?q=${encodeURIComponent(q)}&limit=30`)
      .then(r => { setHits(Array.isArray(r) ? r : []); setDone(true); })
      .catch(() => { setHits([]); setDone(true); })
      .finally(() => setLoading(false));
  }, [q]);

  // group by kind
  const grouped: Record<string, SearchHit[]> = {};
  hits.forEach(h => { (grouped[h.kind] ??= []).push(h); });

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-12">
          <div className="page-heading">
            <h2>
              <i className="fa fa-search" style={{ marginRight: 8 }} />
              Search Results
            </h2>
          </div>
        </div>
      </div>

      {!q.trim() ? (
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox">
              <div className="ibox-content">
                <p className="text-muted" style={{ textAlign: 'center', padding: '30px 0' }}>
                  <i className="fa fa-search" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
                  Enter a search term in the header search box.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-lg-12">
              <p style={{ marginBottom: 16, color: '#676a6c' }}>
                {loading
                  ? 'Searching…'
                  : done
                    ? `${hits.length} result${hits.length !== 1 ? 's' : ''} for `
                    : ''
                }
                {!loading && q && <strong>"{q}"</strong>}
              </p>
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <i className="fa fa-spinner fa-spin" style={{ fontSize: 28, color: '#e2231a' }} />
            </div>
          )}

          {!loading && done && hits.length === 0 && (
            <div className="row">
              <div className="col-lg-12">
                <div className="ibox">
                  <div className="ibox-content">
                    <p className="text-muted" style={{ textAlign: 'center', padding: '30px 0' }}>
                      <i className="fa fa-frown-o" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
                      No results found for "{q}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && Object.entries(grouped).map(([kind, items]) => {
            const meta = KIND_META[kind] ?? { icon: 'fa-tag', label: kind, color: '#999' };
            return (
              <div className="row" key={kind} style={{ marginBottom: 4 }}>
                <div className="col-lg-12">
                  <div className="ibox float-e-margins">
                    <div className="ibox-title">
                      <h5>
                        <i className={`fa ${meta.icon}`} style={{ marginRight: 8, color: meta.color }} />
                        {meta.label}
                        <small className="m-l-sm" style={{ color: '#999' }}>{items.length}</small>
                      </h5>
                    </div>
                    <div className="ibox-content" style={{ padding: '4px 0' }}>
                      {items.map(hit => (
                        <a
                          key={hit.id}
                          href={hit.url ?? '#'}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            padding: '10px 20px',
                            borderBottom: '1px solid #f4f4f4',
                            textDecoration: 'none', color: 'inherit',
                          }}
                        >
                          <i className={`fa ${meta.icon}`} style={{ color: meta.color, marginTop: 2, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{hit.title ?? '(untitled)'}</div>
                            {hit.snippet && (
                              <div style={{ fontSize: 12, color: '#888', marginTop: 2,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 700 }}>
                                {hit.snippet}
                              </div>
                            )}
                          </div>
                          <i className="fa fa-chevron-right" style={{ color: '#ccc', fontSize: 11, flexShrink: 0, marginTop: 3 }} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
