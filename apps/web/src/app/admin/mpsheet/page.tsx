'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface MpRequest {
  id: number;
  equipmentName?: string;
  problemStatement?: string;
  rootCause?: string;
  counterMeasure?: string;
  status?: string;
  requestType?: string;
  plantId?: number;
  createdBy?: number;
  createdAt?: string;
}

interface Stats { total: number; pending: number; approved: number; inProgress: number; closed: number; }

const STATUS_COLOR: Record<string, string> = {
  pending: 'warning', approved: 'success', in_progress: 'primary',
  revision: 'info', rejected: 'danger', closed: 'default',
};

export default function MpsheetAdminPage() {
  const [requests, setRequests] = useState<MpRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, inProgress: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [actionTarget, setActionTarget] = useState<{ id: number; action: string } | null>(null);
  const [remark, setRemark] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [data, st] = await Promise.all([
      apiFetch<MpRequest[]>('/mpsheet/requests?all=1'),
      apiFetch<Stats>('/mpsheet/stats'),
    ]);
    setRequests(data); setStats(st);
    setLoading(false);
  }

  async function postAction() {
    if (!actionTarget) return;
    setActing(true);
    await apiFetch(`/mpsheet/requests/${actionTarget.id}/action`, {
      method: 'POST',
      body: JSON.stringify({ userId: 0, actionType: actionTarget.action, remark }),
    });
    setActionTarget(null); setRemark('');
    await loadAll();
    setActing(false);
  }

  const filtered = requests.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (typeFilter && r.requestType !== typeFilter) return false;
    return true;
  });

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>MP Sheet — Admin</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Admin</Link></li>
            <li className="active"><strong>MP Sheet</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Link href="/admin/reports" className="btn btn-default btn-sm">
            <i className="fa fa-download" style={{ marginRight: 4 }} />Excel
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Stats */}
        <div className="row" style={{ marginBottom: 16 }}>
          {[
            { label: 'Total', value: stats.total, color: '#1c84c6' },
            { label: 'Pending', value: stats.pending, color: '#f8ac59' },
            { label: 'Approved', value: stats.approved, color: '#1ab394' },
            { label: 'Closed', value: stats.closed, color: '#888' },
          ].map(s => (
            <div key={s.label} className="col-lg-3 col-sm-6">
              <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
                <div className="ibox-content" style={{ background: s.color, color: '#fff', borderRadius: 4, padding: '14px 20px' }}>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action modal */}
        {actionTarget && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 4, padding: 24, width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
              <h4 style={{ marginBottom: 12 }}>Action: <strong style={{ textTransform: 'capitalize' }}>{actionTarget.action}</strong></h4>
              <div className="form-group">
                <label>Remark (optional)</label>
                <textarea className="form-control" rows={3} value={remark}
                  onChange={e => setRemark(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" disabled={acting} onClick={postAction}>
                  {acting ? <i className="fa fa-spinner fa-spin" /> : 'Confirm'}
                </button>
                <button className="btn btn-white btn-sm" onClick={() => { setActionTarget(null); setRemark(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="ibox float-e-margins">
          <div className="ibox-title"><h5 style={{ margin: 0 }}>All MP Sheet Requests</h5></div>
          <div className="ibox-content">
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <select className="form-control input-sm" style={{ width: 160 }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="revision">Revision</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </select>
              <select className="form-control input-sm" style={{ width: 160 }}
                value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="equipment">Equipment</option>
                <option value="non-equipment">Non-Equipment</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Equipment</th><th>Problem</th><th>Type</th>
                      <th>Status</th><th>Plant</th><th>Created By</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id}>
                        <td><strong style={{ fontSize: 13 }}>{r.equipmentName ?? '—'}</strong></td>
                        <td style={{ fontSize: 12, color: '#666', maxWidth: 200 }}>
                          {r.problemStatement
                            ? `${r.problemStatement.slice(0, 80)}${r.problemStatement.length > 80 ? '…' : ''}`
                            : '—'}
                        </td>
                        <td>
                          <span className="label label-default" style={{ textTransform: 'capitalize', fontSize: 10 }}>
                            {r.requestType ?? '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`label label-${STATUS_COLOR[r.status ?? ''] ?? 'default'}`} style={{ textTransform: 'capitalize' }}>
                            {r.status ?? '—'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>{r.plantId ?? '—'}</td>
                        <td style={{ fontSize: 12, color: '#888' }}>{r.createdBy ?? '—'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {r.status === 'pending' && (
                            <>
                              <button className="btn btn-xs btn-success" style={{ marginRight: 4 }}
                                title="Approve" onClick={() => setActionTarget({ id: r.id, action: 'approve' })}>
                                <i className="fa fa-check" />
                              </button>
                              <button className="btn btn-xs btn-danger"
                                title="Reject" onClick={() => setActionTarget({ id: r.id, action: 'reject' })}>
                                <i className="fa fa-times" />
                              </button>
                            </>
                          )}
                          {(r.status === 'approved' || r.status === 'in_progress') && (
                            <button className="btn btn-xs btn-default"
                              title="Close" onClick={() => setActionTarget({ id: r.id, action: 'close' })}>
                              <i className="fa fa-lock" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center text-muted" style={{ padding: 24 }}>No requests match the filters.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
