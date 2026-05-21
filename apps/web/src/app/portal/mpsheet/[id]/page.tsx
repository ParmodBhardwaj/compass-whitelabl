'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface MpRequest {
  id: number;
  type?: string;
  raisedBy?: string;
  equipmentNo?: string;
  equipmentName?: string;
  section?: string;
  functionLocation?: string;
  subLocation?: string;
  classificationId?: string;
  machinePartName?: string;
  noOfIncidents?: number;
  costLoss?: number;
  totalHoursLost?: number;
  problemDescription?: string;
  counterMeasure?: string;
  proposedImprovement?: string;
  effectiveness?: string;
  problemCategory?: string;
  imageBefore?: string;
  imageAfter?: string;
  document?: string;
  other?: string;
  status?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  statusUpdatedAt?: string;
}

interface TimelineEntry {
  id: number;
  requestId: number;
  userId: number;
  actionType: string;
  remark?: string;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'warning', submitted: 'info', approved: 'success',
  rejected: 'danger', revision: 'primary', closed: 'default',
  reopened: 'warning',
};

const ACTION_ICON: Record<string, string> = {
  submitted: 'fa-paper-plane', approved: 'fa-check', rejected: 'fa-times',
  revision: 'fa-refresh', closed: 'fa-lock', reopened: 'fa-unlock',
};

export default function MpRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [userId, setUserId] = useState<number | null>(null);
  const [req, setReq] = useState<MpRequest | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAction, setShowAction] = useState(false);
  const [actionForm, setActionForm] = useState({ actionType: 'approved', remark: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
    try {
      const [me, detail] = await Promise.all([
        apiFetch<{ id: number }>('/auth/me'),
        apiFetch<{ request: MpRequest; timeline: TimelineEntry[] }>(`/mpsheet/requests/${params.id}`),
      ]);
      setUserId(me.id);
      setReq(detail.request);
      setTimeline(detail.timeline);
    } catch {}
    setLoading(false);
  }

  async function submitAction(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      await apiFetch(`/mpsheet/requests/${params.id}/action`, {
        method: 'POST',
        body: JSON.stringify({ userId, ...actionForm }),
      });
      await loadData();
      setShowAction(false);
      setActionForm({ actionType: 'approved', remark: '' });
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

  if (!req) {
    return (
      <div className="wrapper wrapper-content">
        <div className="alert alert-danger">MP request not found.</div>
        <Link href="/portal/mpsheet" className="btn btn-white btn-sm">Back</Link>
      </div>
    );
  }

  const isOwner = userId === req.createdBy;
  const canAct = req.status !== 'approved' && req.status !== 'closed';

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{req.equipmentName ?? `MP Request #${req.id}`}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/mpsheet">MP Sheet</Link></li>
            <li className="active"><strong>#{req.id}</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <span className={`label label-${STATUS_COLOR[req.status ?? ''] ?? 'default'}`} style={{ fontSize: 12, textTransform: 'capitalize' }}>
            {req.status ?? 'pending'}
          </span>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-md-8">
            {/* Main analysis */}
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Problem Analysis</h5></div>
              <div className="ibox-content">
                {req.problemDescription && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Problem Description</label>
                    <p style={{ fontSize: 14, lineHeight: 1.7 }}>{req.problemDescription}</p>
                  </div>
                )}
                {req.counterMeasure && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Counter Measure</label>
                    <p style={{ fontSize: 14, lineHeight: 1.7 }}>{req.counterMeasure}</p>
                  </div>
                )}
                {req.proposedImprovement && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Proposed Improvement</label>
                    <p style={{ fontSize: 14, lineHeight: 1.7 }}>{req.proposedImprovement}</p>
                  </div>
                )}
                {req.effectiveness && (
                  <div>
                    <label style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Effectiveness</label>
                    <p style={{ fontSize: 14, lineHeight: 1.7 }}>{req.effectiveness}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Before/After images */}
            {(req.imageBefore || req.imageAfter) && (
              <div className="ibox float-e-margins">
                <div className="ibox-title"><h5 style={{ margin: 0 }}>Before & After</h5></div>
                <div className="ibox-content">
                  <div className="row">
                    {req.imageBefore && (
                      <div className="col-sm-6">
                        <p style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: '#888' }}>Before</p>
                        <img src={`/api/uploads/${req.imageBefore}`} alt="Before"
                          style={{ width: '100%', borderRadius: 4, border: '1px solid #eee', maxHeight: 250, objectFit: 'cover' }} />
                      </div>
                    )}
                    {req.imageAfter && (
                      <div className="col-sm-6">
                        <p style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: '#888' }}>After</p>
                        <img src={`/api/uploads/${req.imageAfter}`} alt="After"
                          style={{ width: '100%', borderRadius: 4, border: '1px solid #eee', maxHeight: 250, objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>Action Timeline <small style={{ color: '#999' }}>({timeline.length})</small></h5>
                </div>
                <div className="ibox-content" style={{ padding: 0 }}>
                  {timeline.map((t, i) => (
                    <div key={t.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: i < timeline.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1c84c6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`fa ${ACTION_ICON[t.actionType] ?? 'fa-dot-circle-o'}`} style={{ color: '#fff', fontSize: 13 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div>
                            <strong style={{ fontSize: 13 }}>Employee #{t.userId}</strong>
                            <span className={`label label-${STATUS_COLOR[t.actionType] ?? 'default'}`}
                              style={{ marginLeft: 6, fontSize: 10, textTransform: 'capitalize' }}>
                              {t.actionType}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(t.createdAt).toLocaleString()}</span>
                        </div>
                        {t.remark && <p style={{ margin: '4px 0 0', fontSize: 14, color: '#555' }}>{t.remark}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action panel */}
            {canAct && (
              <div className="ibox float-e-margins">
                <div className="ibox-title"><h5 style={{ margin: 0 }}>Take Action</h5></div>
                <div className="ibox-content">
                  {!showAction ? (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAction(true)}>
                      <i className="fa fa-gavel" style={{ marginRight: 4 }} />Update Status
                    </button>
                  ) : (
                    <form onSubmit={submitAction}>
                      <div className="row">
                        <div className="col-sm-4">
                          <div className="form-group">
                            <label>Action</label>
                            <select className="form-control" value={actionForm.actionType}
                              onChange={e => setActionForm(f => ({ ...f, actionType: e.target.value }))}>
                              {isOwner
                                ? <option value="submitted">Submit for Review</option>
                                : <>
                                  <option value="approved">Approve</option>
                                  <option value="rejected">Reject</option>
                                  <option value="revision">Request Revision</option>
                                  <option value="closed">Close</option>
                                </>
                              }
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <div className="form-group">
                            <label>Remarks</label>
                            <textarea className="form-control" rows={2} value={actionForm.remark}
                              onChange={e => setActionForm(f => ({ ...f, remark: e.target.value }))} />
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
              </div>
            )}
          </div>

          {/* Info sidebar */}
          <div className="col-md-4">
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Request Info</h5></div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {[
                  { label: 'ID', value: `#${req.id}` },
                  { label: 'Type', value: <span className={`label label-${req.type === 'equipment' ? 'info' : 'default'}`} style={{ textTransform: 'capitalize' }}>{req.type ?? '—'}</span> },
                  { label: 'Status', value: <span className={`label label-${STATUS_COLOR[req.status ?? ''] ?? 'default'}`} style={{ textTransform: 'capitalize' }}>{req.status ?? '—'}</span> },
                  { label: 'Equipment', value: req.equipmentName ?? '—' },
                  { label: 'Equip. No.', value: req.equipmentNo ?? '—' },
                  { label: 'Part', value: req.machinePartName ?? '—' },
                  { label: 'Location', value: req.functionLocation ?? '—' },
                  { label: 'Section', value: req.section ?? '—' },
                  { label: 'Category', value: req.problemCategory ?? '—' },
                  { label: 'Incidents', value: req.noOfIncidents ?? '—' },
                  { label: 'Cost Loss', value: req.costLoss ? `₹${Number(req.costLoss).toLocaleString()}` : '—' },
                  { label: 'Hrs Lost', value: req.totalHoursLost ?? '—' },
                  { label: 'Raised By', value: `Employee #${req.createdBy}` },
                  { label: 'Created', value: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', padding: '9px 14px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 90, fontSize: 12, color: '#999', textTransform: 'uppercase', flexShrink: 0 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
                {req.other && (
                  <div style={{ padding: '9px 14px' }}>
                    <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>Other</div>
                    <div style={{ fontSize: 13 }}>{req.other}</div>
                  </div>
                )}
              </div>
            </div>

            {req.document && (
              <a href={`/api/uploads/${req.document}`} target="_blank" rel="noreferrer"
                className="btn btn-white btn-sm btn-block">
                <i className="fa fa-file-pdf-o" style={{ marginRight: 4 }} />View Document
              </a>
            )}
          </div>
        </div>

        <Link href="/portal/mpsheet" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to MP Sheet
        </Link>
      </div>
    </>
  );
}
