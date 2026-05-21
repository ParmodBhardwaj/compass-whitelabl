'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface HazardDetail {
  request: {
    id: number;
    description?: string;
    riskLevel?: string;
    status?: string;
    endDate?: string;
    createdAt?: string;
    plantId?: number;
    categoryId?: number;
    impactId?: number;
    photo?: string;
    remarks?: string;
    adminRemark?: string;
    createdBy?: number;
    assignedTo?: number;
    currentlyAssign?: number;
  };
  timeline: TimelineEntry[];
}

interface TimelineEntry {
  id: number;
  parentId?: number;
  requestId: number;
  postedBy: number;
  postTo: number;
  initiatorAction?: string;
  correctorAction?: string;
  description?: string;
  targetDate?: string;
  photo?: string;
  createdAt: string;
}

const RISK_COLOR: Record<string, string> = { High: 'danger', Medium: 'warning', Low: 'success' };
const STATUS_COLOR: Record<string, string> = { open: 'primary', in_progress: 'info', closed: 'success', rejected: 'default' };

export default function HazardDetailPage() {
  const params = useParams<{ id: string }>();
  const [userId, setUserId] = useState<number | null>(null);
  const [data, setData] = useState<HazardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAction, setShowAction] = useState(false);
  const [actionForm, setActionForm] = useState({
    description: '', targetDate: '', correctorAction: '', initiatorAction: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [me, detail] = await Promise.all([
          apiFetch<{ id: number }>('/auth/me'),
          apiFetch<HazardDetail>(`/tpm/hazard/${params.id}`),
        ]);
        setUserId(me.id);
        setData(detail);
      } catch {}
      setLoading(false);
    })();
  }, [params.id]);

  async function postAction(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !data) return;
    setSaving(true);
    try {
      await apiFetch(`/tpm/hazard/${params.id}/timeline`, {
        method: 'POST',
        body: JSON.stringify({
          postedBy: userId,
          postTo: data.request.createdBy ?? 0,
          ...actionForm,
        }),
      });
      const updated = await apiFetch<HazardDetail>(`/tpm/hazard/${params.id}`);
      setData(updated);
      setShowAction(false);
      setActionForm({ description: '', targetDate: '', correctorAction: '', initiatorAction: '' });
    } catch {}
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="ibox"><div className="ibox-content text-center" style={{ padding: 40 }}>
          <i className="fa fa-spinner fa-spin fa-2x text-muted" />
        </div></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="wrapper wrapper-content">
        <div className="alert alert-danger">Hazard request not found.</div>
        <Link href="/portal/tpm/hazard" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back
        </Link>
      </div>
    );
  }

  const { request, timeline } = data;
  const statusCls = STATUS_COLOR[request.status ?? ''] ?? 'default';
  const riskCls = RISK_COLOR[request.riskLevel ?? ''] ?? 'default';
  const canAct = userId && (userId === request.currentlyAssign || userId === request.createdBy) && request.status !== 'closed';

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Hazard #{request.id}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/tpm/hazard">Hazard</Link></li>
            <li className="active"><strong>#{request.id}</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <span className={`label label-${riskCls}`} style={{ fontSize: 12 }}>{request.riskLevel}</span>
          <span className={`label label-${statusCls}`} style={{ fontSize: 12 }}>{request.status?.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-lg-8">

            {/* Description */}
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Hazard Description</h5></div>
              <div className="ibox-content">
                <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 0 }}>{request.description}</p>
                {request.photo && (
                  <div style={{ marginTop: 12 }}>
                    <img src={`/api/uploads/${request.photo}`} alt="Hazard photo"
                      style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 4, border: '1px solid #eee' }} />
                  </div>
                )}
                {request.remarks && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: '#fffbe6', borderLeft: '4px solid #f1c40f', borderRadius: 3 }}>
                    <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888' }}>Remarks:</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 13 }}>{request.remarks}</p>
                  </div>
                )}
                {request.adminRemark && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#ffeef0', borderLeft: '4px solid #e74c3c', borderRadius: 3 }}>
                    <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#888' }}>Admin Remark:</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 13 }}>{request.adminRemark}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>
                  Activity Timeline <small style={{ color: '#999' }}>({timeline.length})</small>
                </h5>
              </div>
              <div className="ibox-content">
                {timeline.length === 0 ? (
                  <p className="text-muted text-center" style={{ padding: 20 }}>No activity yet.</p>
                ) : (
                  <div className="timeline-content">
                    {timeline.map((t, i) => (
                      <div key={t.id} style={{
                        display: 'flex', gap: 16, marginBottom: 20,
                        paddingBottom: 20, borderBottom: i < timeline.length - 1 ? '1px solid #f0f0f0' : 'none',
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', background: '#1ab394',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <i className="fa fa-user" style={{ color: '#fff', fontSize: 14 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <strong style={{ fontSize: 13 }}>Employee #{t.postedBy}</strong>
                            <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(t.createdAt).toLocaleString()}</span>
                          </div>
                          {(t.initiatorAction || t.correctorAction) && (
                            <div style={{ marginBottom: 6 }}>
                              {t.initiatorAction && <span className="label label-info" style={{ marginRight: 4 }}>{t.initiatorAction}</span>}
                              {t.correctorAction && <span className="label label-success">{t.correctorAction}</span>}
                            </div>
                          )}
                          {t.description && <p style={{ margin: 0, fontSize: 14 }}>{t.description}</p>}
                          {t.targetDate && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>Target: {t.targetDate}</p>}
                          {t.photo && (
                            <img src={`/api/uploads/${t.photo}`} alt="Action photo"
                              style={{ marginTop: 8, maxWidth: 200, maxHeight: 150, borderRadius: 4, border: '1px solid #eee' }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {canAct && (
                  <div style={{ marginTop: 16 }}>
                    {!showAction ? (
                      <button className="btn btn-primary btn-sm" onClick={() => setShowAction(true)}>
                        <i className="fa fa-reply" style={{ marginRight: 4 }} />Post Action
                      </button>
                    ) : (
                      <form onSubmit={postAction} style={{ background: '#f9f9f9', padding: 16, borderRadius: 4, border: '1px solid #e7eaec' }}>
                        <div className="row">
                          <div className="col-sm-6">
                            <div className="form-group">
                              <label>Your Action</label>
                              <select className="form-control input-sm" value={actionForm.correctorAction}
                                onChange={e => setActionForm(f => ({ ...f, correctorAction: e.target.value }))}>
                                <option value="">— Select —</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="corrected">Corrected</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-sm-6">
                            <div className="form-group">
                              <label>Target Date</label>
                              <input type="date" className="form-control input-sm" value={actionForm.targetDate}
                                onChange={e => setActionForm(f => ({ ...f, targetDate: e.target.value }))} />
                            </div>
                          </div>
                          <div className="col-sm-12">
                            <div className="form-group">
                              <label>Description</label>
                              <textarea className="form-control input-sm" rows={2} value={actionForm.description}
                                onChange={e => setActionForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                            {saving ? <i className="fa fa-spinner fa-spin" /> : 'Submit'}
                          </button>
                          <button type="button" className="btn btn-white btn-sm" onClick={() => setShowAction(false)}>Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="col-lg-4">
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Details</h5></div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {[
                  { label: 'Hazard ID', value: `#${request.id}` },
                  { label: 'Risk Level', value: <span className={`label label-${riskCls}`}>{request.riskLevel}</span> },
                  { label: 'Status', value: <span className={`label label-${statusCls}`}>{request.status?.replace('_', ' ')}</span> },
                  { label: 'Target Date', value: request.endDate ?? '—' },
                  { label: 'Raised By', value: `Employee #${request.createdBy}` },
                  { label: 'Assigned To', value: request.assignedTo ? `Employee #${request.assignedTo}` : '—' },
                  { label: 'Created', value: request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 120, fontSize: 12, color: '#999', textTransform: 'uppercase', flexShrink: 0 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Link href="/portal/tpm/hazard" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to Hazards
        </Link>
      </div>
    </>
  );
}
