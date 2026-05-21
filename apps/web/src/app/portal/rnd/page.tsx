'use client';
/**
 * /portal/rnd — R&D Portal landing.
 *
 * Mirrors legacy /rnd/rnd.html: hero banner with CEO message + overview,
 * notice strip, new-joinees grid, competitor product table, recent
 * birthdays, latest news. One round-trip via /v2/rnd/dashboard.
 */
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/auth';
import { resolveImage } from '@/lib/legacy-url';

interface Notice { id: number; description?: string; status?: string }
interface Joinee {
  id: number; name?: string; designation?: string;
  description?: string; image?: string; type?: string; storeId?: number;
}
interface CompetitorProduct {
  id: number; name?: string; price?: number | string;
  description?: string; image?: string; status?: string;
}
interface CeoMessage { id: number; title?: string; description?: string; image?: string }
interface Birthday {
  id: number; name?: string; designation?: string;
  department?: string; dob?: string; profilepic?: string;
}
interface NewsItem {
  id: number; title?: string; shortDescription?: string;
  image?: string; newsDate?: string;
}

interface Dashboard {
  notice: Notice | null;
  joinees: Joinee[];
  products: CompetitorProduct[];
  ceoMessage: CeoMessage | null;
  overview: CeoMessage | null;
  news: NewsItem[];
  birthdays: Birthday[];
}

type Tab = 'home' | 'joinees' | 'competitors' | 'birthdays' | 'news';

export default function RndPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('home');

  useEffect(() => {
    apiFetch<Dashboard>('/rnd/dashboard?storeId=6')
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <i className="fa fa-spinner fa-spin" style={{ fontSize: 28, color: '#9b59b6' }} />
        </div>
      </div>
    );
  }

  const d = data ?? {
    notice: null, joinees: [], products: [], ceoMessage: null, overview: null,
    news: [], birthdays: [],
  };

  const tabs: Array<{ key: Tab; label: string; icon: string; count?: number }> = [
    { key: 'home',        label: 'Home',                icon: 'fa-home' },
    { key: 'joinees',     label: 'New Joinees',         icon: 'fa-users',         count: d.joinees.length },
    { key: 'competitors', label: 'Competitor Products', icon: 'fa-shopping-cart', count: d.products.length },
    { key: 'birthdays',   label: 'Birthdays',           icon: 'fa-birthday-cake', count: d.birthdays.length },
    { key: 'news',        label: 'News',                icon: 'fa-newspaper-o',   count: d.news.length },
  ];

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      {/* Header */}
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h5 style={{ margin: 0 }}>
                <i className="fa fa-flask" style={{ marginRight: 8, color: '#9b59b6' }} />
                R&amp;D Portal
              </h5>
              <span style={{ background: '#9b59b6', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 12 }}>
                Research &amp; Development
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-content" style={{ padding: '0 20px' }}>
              <ul style={{
                display: 'flex', listStyle: 'none', padding: 0, margin: 0,
                borderBottom: '2px solid #e5e5e5', gap: 0, flexWrap: 'wrap',
              }}>
                {tabs.map(t => (
                  <li key={t.key}>
                    <button
                      onClick={() => setTab(t.key)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '14px 20px', fontSize: 13, fontWeight: 600,
                        color: tab === t.key ? '#9b59b6' : '#676a6c',
                        borderBottom: tab === t.key ? '2px solid #9b59b6' : '2px solid transparent',
                        marginBottom: -2, display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <i className={`fa ${t.icon}`} />
                      {t.label}
                      {t.count !== undefined && (
                        <span style={{
                          background: tab === t.key ? '#9b59b6' : '#f4f4f4',
                          color: tab === t.key ? '#fff' : '#888',
                          borderRadius: 10, padding: '0 7px', fontSize: 11,
                        }}>
                          {t.count}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tab: Home (CEO message + notice + overview) */}
      {tab === 'home' && (
        <>
          {/* Notice strip */}
          {d.notice?.description && (
            <div className="row">
              <div className="col-lg-12">
                <div className="ibox float-e-margins">
                  <div className="ibox-content" style={{
                    background: 'linear-gradient(90deg, #fff7e0 0%, #fff 70%)',
                    borderLeft: '4px solid #f8ac59',
                    display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16,
                  }}>
                    <i className="fa fa-bullhorn" style={{ color: '#f8ac59', fontSize: 22, marginTop: 4 }} />
                    <div
                      style={{ flex: 1, fontSize: 14, color: '#555', lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: d.notice.description }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CEO message + Overview */}
          <div className="row">
            {d.ceoMessage && (
              <div className="col-md-6">
                <div className="ibox float-e-margins">
                  <div className="ibox-title">
                    <h5 style={{ margin: 0 }}>
                      <i className="fa fa-comment-o" style={{ color: '#1c84c6', marginRight: 8 }} />
                      {d.ceoMessage.title ?? 'Message'}
                    </h5>
                  </div>
                  <div className="ibox-content">
                    {d.ceoMessage.image && (
                      <img
                        src={resolveImage(d.ceoMessage.image, 'rnd') ?? ''}
                        alt=""
                        style={{ width: 80, height: 80, borderRadius: '50%', float: 'left', marginRight: 16, objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div
                      style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: d.ceoMessage.description ?? '' }}
                    />
                  </div>
                </div>
              </div>
            )}
            {d.overview && (
              <div className="col-md-6">
                <div className="ibox float-e-margins">
                  <div className="ibox-title">
                    <h5 style={{ margin: 0 }}>
                      <i className="fa fa-info-circle" style={{ color: '#1ab394', marginRight: 8 }} />
                      {d.overview.title ?? 'Overview'}
                    </h5>
                  </div>
                  <div className="ibox-content">
                    <div
                      style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: d.overview.description ?? '' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: New Joinees */}
      {tab === 'joinees' && (
        <div className="row">
          {d.joinees.length === 0 ? (
            <div className="col-lg-12"><EmptyState icon="fa-users" text="No new joinees." /></div>
          ) : d.joinees.map(j => (
            <div className="col-md-4 col-sm-6" key={j.id}>
              <div className="ibox float-e-margins">
                <div className="ibox-content" style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <img
                    src={resolveImage(j.image, 'rnd') ?? '/img/profile.png'}
                    alt={j.name ?? ''}
                    style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: '50%', border: '3px solid #e5e5e5' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile.png'; }}
                  />
                  <div style={{ marginTop: 12, fontWeight: 700, fontSize: 15 }}>{j.name}</div>
                  {j.designation && (
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{j.designation}</div>
                  )}
                  {j.type && (
                    <span style={{
                      display: 'inline-block', marginTop: 8,
                      background: '#9b59b622', color: '#9b59b6',
                      borderRadius: 12, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                    }}>
                      {j.type}
                    </span>
                  )}
                  {j.description && (
                    <p style={{ fontSize: 12, color: '#777', marginTop: 10, lineHeight: 1.5 }}>
                      {j.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Competitor Products */}
      {tab === 'competitors' && (
        <div className="row">
          <div className="col-lg-12">
            {d.products.length === 0 ? (
              <EmptyState icon="fa-shopping-cart" text="No competitor products listed." />
            ) : (
              <div className="ibox float-e-margins">
                <div className="ibox-content" style={{ padding: 0 }}>
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ width: 80, padding: '10px 16px' }}>Image</th>
                        <th style={{ padding: '10px 16px' }}>Product Name</th>
                        <th style={{ padding: '10px 16px' }}>Price</th>
                        <th style={{ padding: '10px 16px' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.products.map(p => (
                        <tr key={p.id}>
                          <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
                            {p.image ? (
                              <img
                                src={resolveImage(p.image, 'rnd') ?? ''}
                                alt={p.name ?? ''}
                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e5e5' }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div style={{ width: 60, height: 60, background: '#f4f4f4', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa fa-motorcycle" style={{ color: '#ccc', fontSize: 20 }} />
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '10px 16px', verticalAlign: 'middle', fontWeight: 600, fontSize: 14 }}>{p.name}</td>
                          <td style={{ padding: '10px 16px', verticalAlign: 'middle', color: '#e2231a', fontWeight: 700 }}>
                            {p.price != null ? `₹${Number(p.price).toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td style={{ padding: '10px 16px', verticalAlign: 'middle', fontSize: 13, color: '#666' }}>
                            {p.description ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Birthdays */}
      {tab === 'birthdays' && (
        <div className="row">
          {d.birthdays.length === 0 ? (
            <div className="col-lg-12"><EmptyState icon="fa-birthday-cake" text="No birthdays in the next 7 days." /></div>
          ) : d.birthdays.map(b => (
            <div className="col-md-3 col-sm-6" key={b.id}>
              <div className="ibox float-e-margins">
                <div className="ibox-content" style={{ textAlign: 'center', padding: 18 }}>
                  <img
                    src={resolveImage(b.profilepic, 'employee') ?? '/img/profile.png'}
                    alt={b.name ?? ''}
                    style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '50%', border: '2px solid #ffd1d5' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile.png'; }}
                  />
                  <div style={{ marginTop: 10, fontWeight: 700, fontSize: 13 }}>{b.name}</div>
                  {b.designation && <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{b.designation}</div>}
                  <div style={{ marginTop: 6, color: '#e2231a', fontSize: 12, fontWeight: 600 }}>
                    <i className="fa fa-birthday-cake" style={{ marginRight: 4 }} />
                    {b.dob ? new Date(b.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: News */}
      {tab === 'news' && (
        <div className="row">
          {d.news.length === 0 ? (
            <div className="col-lg-12"><EmptyState icon="fa-newspaper-o" text="No featured news." /></div>
          ) : d.news.map(n => (
            <div className="col-md-6" key={n.id}>
              <div className="ibox float-e-margins">
                <div className="ibox-content" style={{ display: 'flex', gap: 14 }}>
                  {n.image && (
                    <img
                      src={resolveImage(n.image, 'news') ?? ''}
                      alt=""
                      style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                      {n.newsDate ? new Date(n.newsDate).toLocaleDateString() : ''}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>{n.title}</div>
                    {n.shortDescription && (
                      <div style={{ fontSize: 12, color: '#666', marginTop: 6, lineHeight: 1.5 }}>
                        {n.shortDescription}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="ibox float-e-margins">
      <div className="ibox-content" style={{ textAlign: 'center', padding: '50px 0', color: '#aaa' }}>
        <i className={`fa ${icon}`} style={{ fontSize: 36, display: 'block', marginBottom: 14 }} />
        <p style={{ margin: 0, fontSize: 14 }}>{text}</p>
      </div>
    </div>
  );
}
