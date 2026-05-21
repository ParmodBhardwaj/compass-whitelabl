'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface MpRequest {
  id: number;
  type?: string;
  equipmentName?: string;
  equipmentNo?: string;
  machinePartName?: string;
  problemCategory?: string;
  problemDescription?: string;
  status?: string;
  createdBy?: number;
  createdAt?: string;
  statusUpdatedAt?: string;
  noOfIncidents?: number;
  costLoss?: number;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  closed: number;
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'warning',
  submitted: 'info',
  approved: 'success',
  rejected: 'danger',
  revision: 'primary',
  closed: 'default',
};

export default function MpSheetPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [requests, setRequests] = useState<MpRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'my' | 'all'>('my');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    (async () => {
      const me = await apiFetch<{ id: number }>('/auth/me');
      setUserId(me.id);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadData();
  }, [userId, tab, statusFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab === 'my') params.set('createdBy', String(userId));
      else params.set('all', '1');
      if (statusFilter) params.set('status', statusFilter);

      const [data, st] = await Promise.all([
        apiFetch<MpRequest[]>(`/mpsheet/requests?${params}`),
        apiFetch<Stats>(`/mpsheet/stats?${tab === 'my' ? `createdBy=${userId}` : ''}`),
      ]);
      setRequests(data);
      setStats(st);
    } catch {}
    setLoading(false);
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>MP Sheet</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>MP Sheet</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Link href="/portal/mpsheet/new" className="btn btn-primary btn-sm">
            <i className="fa fa-plus" style={{ marginRight: 4 }} />New Request
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Stats tiles */}
        <div className="row" style={{ marginBottom: 16 }}>
          {[
            { label: 'Total', value: stats.total, bg: '#1c84c6' },
            { label: 'Pending', value: stats.pending, bg: '#f8ac59' },
            { label: 'Approved', value: stats.approved, bg: '#1ab394' },
            { label: 'Rejected', value: stats.rejected, bg: '#ed5565' },
            { label: 'Closed', value: stats.closed, bg: '#888' },
          ].map(({ label, value, bg }) => (
            <div key={label} className="col-lg-2 col-sm-4" style={{ marginBottom: 8 }}>
              <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
                <div className="ibox-content" style={{ background: bg, color: '#fff', borderRadius: 4, padding: '14px 18px' }}>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              {(['my', 'all'] as const).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}>
                    {t === 'my' ? 'My Requests' : 'All Requests'}
                  </a>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-control input-sm" style={{ width: 140 }} value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {['pending', 'submitted', 'approved', 'rejected', 'revision', 'closed'].map(s => (
                  <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 40 }}>
                <i className="fa fa-wrench fa-3x" style={{ marginBottom: 12 }} />
                <p>No MP requests found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Type</th>
                      <th>Equipment</th>
                      <th>Problem Category</th>
                      <th>Incidents</th>
                      <th>Cost Loss</th>
                      <th>Status</th>
                      <th>Raised On</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.id}>
                        <td style={{ color: '#999', fontSize: 12 }}>{r.id}</td>
                        <td>
                          <span className={`label label-${r.type === 'equipment' ? 'info' : 'default'}`}
                            style={{ textTransform: 'capitalize' }}>
                            {r.type ?? '—'}
                          </span>
                        </td>
                        <td>
                          <Link href={`/portal/mpsheet/${r.id}`} style={{ fontWeight: 600 }}>
                            {r.equipmentName ?? `Equipment #${r.id}`}
                          </Link>
                          {r.equipmentNo && (
                            <div style={{ fontSize: 11, color: '#888' }}>#{r.equipmentNo}</div>
                          )}
                          {r.machinePartName && (
                            <div style={{ fontSize: 11, color: '#888' }}>Part: {r.machinePartName}</div>
                          )}
                        </td>
                        <td style={{ fontSize: 13 }}>{r.problemCategory ?? '—'}</td>
                        <td style={{ textAlign: 'center' }}>{r.noOfIncidents ?? '—'}</td>
                        <td style={{ fontSize: 13 }}>
                          {r.costLoss ? `₹${Number(r.costLoss).toLocaleString()}` : '—'}
                        </td>
                        <td>
                          <span className={`label label-${STATUS_COLOR[r.status ?? ''] ?? 'default'}`}
                            style={{ textTransform: 'capitalize' }}>
                            {r.status ?? '—'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <Link href={`/portal/mpsheet/${r.id}`} className="btn btn-xs btn-white">
                            View
                          </Link>
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
