'use client';
/**
 * /portal/visitors — Visitor Gate Pass landing.
 *
 * Mirrors the legacy /visitors/home.html + /visitors/visitor-request.html
 * combo: stats strip, status tabs (Pending / Approved / Completed / All),
 * quick-link tiles to Add Appointment, Frequent Visitors, Pending
 * Feedback. Per-row actions: view, cancel, gate-pass print.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Appointment {
  id: number;
  visitorLocationId: number;
  company: string;
  purposeOfVisit?: string;
  contactPerson: number;
  passType?: string;
  requestStatus?: string;
  validFromDate?: string;
  validToDate?: string;
  barcodeNumber?: string;
  createdAt?: string;
}

interface Location { id: number; locationName?: string; name?: string; }
interface Stats { total: number; pending: number; approved: number; rejected: number; }

const STATUS_COLOR: Record<string, string> = {
  pending: 'warning', approved: 'success', rejected: 'danger',
  cancelled: 'default', completed: 'info',
};

const PASS_TYPE_COLORS: Record<string, string> = {
  green: 'success', yellow: 'warning', red: 'danger', blue: 'primary',
};

type TabKey = 'pending' | 'approved' | 'completed' | 'all';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'pending',   label: 'Pending',   icon: 'fa-hourglass-half' },
  { key: 'approved',  label: 'Approved',  icon: 'fa-check-circle' },
  { key: 'completed', label: 'Completed', icon: 'fa-flag-checkered' },
  { key: 'all',       label: 'All',       icon: 'fa-list' },
];

export default function VisitorsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('pending');
  const [scope, setScope] = useState<'my' | 'all'>('my');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const me = await apiFetch<{ id: number }>('/auth/me');
      setUserId(me.id);
      const locs = await apiFetch<Location[]>('/visitors/locations');
      setLocations(locs);
      await refreshData(me.id, 'my');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userId) refreshData(userId, scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  async function refreshData(uid: number, sc: 'my' | 'all') {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sc === 'my') params.set('contactPerson', String(uid));
      else params.set('all', '1');
      const [apts, st] = await Promise.all([
        apiFetch<Appointment[]>(`/visitors/appointments?${params}`),
        apiFetch<Stats>(`/visitors/stats?contactPerson=${uid}`),
      ]);
      setAppointments(apts);
      setStats(st);
    } catch {}
    setLoading(false);
  }

  async function cancelAppt(id: number) {
    if (!confirm('Cancel this appointment?')) return;
    await apiFetch(`/visitors/appointments/${id}/cancel`, { method: 'PUT' });
    setAppointments(a => a.map(x => x.id === id ? { ...x, requestStatus: 'cancelled' } : x));
  }

  const locationLabel = (id: number) => {
    const l = locations.find(x => x.id === id);
    return l ? (l.locationName ?? l.name ?? `Location #${id}`) : `Location #${id}`;
  };

  const filtered = appointments.filter(a => {
    if (tab !== 'all' && (a.requestStatus ?? '') !== tab) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!(a.company ?? '').toLowerCase().includes(s) &&
          !(a.barcodeNumber ?? '').toLowerCase().includes(s) &&
          !(a.purposeOfVisit ?? '').toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  });

  const tabCount = (k: TabKey) =>
    k === 'all'
      ? appointments.length
      : appointments.filter(a => (a.requestStatus ?? '') === k).length;

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-8">
          <h2>Visitor Gate Pass</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Visitor Gate Pass</strong></li>
          </ol>
        </div>
        <div className="col-lg-4" style={{ paddingTop: 20, textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Link href="/portal/visitors/frequent" className="btn btn-white btn-sm">
            <i className="fa fa-users" style={{ marginRight: 4 }} />Frequent
          </Link>
          <Link href="/portal/visitors/feedback" className="btn btn-white btn-sm">
            <i className="fa fa-comments-o" style={{ marginRight: 4 }} />Feedback
          </Link>
          <Link href="/portal/visitors/appointment/add" className="btn btn-primary btn-sm">
            <i className="fa fa-plus" style={{ marginRight: 4 }} />New Appointment
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Stats */}
        <div className="row" style={{ marginBottom: 16 }}>
          {[
            { label: 'Total',    value: stats.total,    bg: '#1c84c6', icon: 'fa-id-card' },
            { label: 'Pending',  value: stats.pending,  bg: '#f8ac59', icon: 'fa-hourglass-half' },
            { label: 'Approved', value: stats.approved, bg: '#1ab394', icon: 'fa-check-circle' },
            { label: 'Rejected', value: stats.rejected, bg: '#ed5565', icon: 'fa-times-circle' },
          ].map(({ label, value, bg, icon }) => (
            <div key={label} className="col-lg-3 col-sm-6" style={{ marginBottom: 8 }}>
              <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
                <div className="ibox-content" style={{
                  background: bg, color: '#fff', borderRadius: 4, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <i className={`fa ${icon}`} style={{ fontSize: 32, opacity: 0.7 }} />
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>{label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick action tiles */}
        <div className="row" style={{ marginBottom: 16 }}>
          {[
            { title: 'New Appointment', desc: 'Book a single or batch visitor pass', href: '/portal/visitors/appointment/add', icon: 'fa-plus-circle', color: '#1c84c6' },
            { title: 'Frequent Visitors', desc: 'One-click rebook past visitors',     href: '/portal/visitors/frequent',        icon: 'fa-users',       color: '#1ab394' },
            { title: 'Pending Feedback', desc: 'Rate recent visits',                  href: '/portal/visitors/feedback',        icon: 'fa-comments-o',  color: '#f8ac59' },
          ].map(a => (
            <div className="col-md-4 col-sm-6" key={a.title}>
              <Link href={a.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="ibox float-e-margins" style={{ cursor: 'pointer' }}>
                  <div className="ibox-content" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 18 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: a.color + '22',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <i className={`fa ${a.icon}`} style={{ fontSize: 20, color: a.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{a.title}</h4>
                      <small style={{ color: '#888' }}>{a.desc}</small>
                    </div>
                    <i className="fa fa-angle-right" style={{ color: '#bbb' }} />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', margin: 0, flex: 1 }}>
              {TABS.map(t => (
                <li key={t.key} className={tab === t.key ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t.key); }}>
                    <i className={`fa ${t.icon}`} style={{ marginRight: 6 }} />
                    {t.label}
                    {' '}
                    <span className="badge" style={{ marginLeft: 4 }}>{tabCount(t.key)}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                className="form-control input-sm"
                value={scope}
                onChange={e => setScope(e.target.value as 'my' | 'all')}
                style={{ width: 130 }}
              >
                <option value="my">My Requests</option>
                <option value="all">All Requests</option>
              </select>
              <input
                className="form-control input-sm"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 180 }}
              />
            </div>
          </div>
          <div className="ibox-content" style={{ padding: 0 }}>
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 50 }}>
                <i className="fa fa-id-card fa-3x" style={{ marginBottom: 12, color: '#ddd' }} />
                <p>No appointments in this view.</p>
                <Link href="/portal/visitors/appointment/add" className="btn btn-primary btn-sm">
                  <i className="fa fa-plus" style={{ marginRight: 4 }} />Create one
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: '10px 16px', fontSize: 12 }}>#</th>
                      <th style={{ padding: '10px 16px', fontSize: 12 }}>Company</th>
                      <th style={{ padding: '10px 16px', fontSize: 12 }}>Location</th>
                      <th style={{ padding: '10px 16px', fontSize: 12 }}>Pass</th>
                      <th style={{ padding: '10px 16px', fontSize: 12 }}>Visit From</th>
                      <th style={{ padding: '10px 16px', fontSize: 12 }}>Visit To</th>
                      <th style={{ padding: '10px 16px', fontSize: 12 }}>Status</th>
                      <th style={{ padding: '10px 16px', fontSize: 12 }}>Barcode</th>
                      <th style={{ padding: '10px 16px', fontSize: 12 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id}>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#999' }}>
                          <Link href={`/portal/visitors/appointment/${a.id}`}>#{a.id}</Link>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500 }}>{a.company}</td>
                        <td style={{ padding: '10px 16px', fontSize: 13 }}>{locationLabel(a.visitorLocationId)}</td>
                        <td style={{ padding: '10px 16px' }}>
                          {a.passType && (
                            <span className={`label label-${PASS_TYPE_COLORS[a.passType] ?? 'default'}`}
                              style={{ textTransform: 'capitalize', fontSize: 11 }}>
                              {a.passType}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12 }}>{a.validFromDate ?? '—'}</td>
                        <td style={{ padding: '10px 16px', fontSize: 12 }}>{a.validToDate ?? '—'}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span className={`label label-${STATUS_COLOR[a.requestStatus ?? ''] ?? 'default'}`}
                            style={{ textTransform: 'capitalize', fontSize: 11 }}>
                            {a.requestStatus ?? '—'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 11, color: '#888', fontFamily: 'monospace' }}>
                          {a.barcodeNumber ?? '—'}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                          <Link href={`/portal/visitors/appointment/${a.id}`} className="btn btn-xs btn-white" style={{ marginRight: 4 }}>
                            <i className="fa fa-eye" />
                          </Link>
                          {a.requestStatus === 'approved' && (
                            <Link href={`/portal/visitors/gate-pass/${a.id}`} target="_blank" className="btn btn-xs btn-success" style={{ marginRight: 4 }}>
                              <i className="fa fa-print" />
                            </Link>
                          )}
                          {(a.requestStatus === 'pending' || a.requestStatus === 'approved') && (
                            <button className="btn btn-xs btn-danger" onClick={() => cancelAppt(a.id)}>
                              <i className="fa fa-times" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
