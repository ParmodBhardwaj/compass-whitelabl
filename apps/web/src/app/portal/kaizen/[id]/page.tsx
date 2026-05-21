'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface KaizenDetail {
  kaizen: {
    id: number;
    kaizenNo?: string;
    pillarId?: number;
    sectionId?: number;
    category?: string;
    savingType?: string;
    type?: string;
    idea?: string;
    imageBefore?: string;
    imageAfter?: string;
    beforeImageRemark?: string;
    afterImageRemark?: string;
    problemDefinition?: string;
    counterMeasure?: string;
    resultBefore?: string;
    resultAfter?: string;
    analysis?: string;
    horizontalDeployment?: string;
    startDate?: string;
    endDate?: string;
    annualBenefits?: number;
    investment?: number;
    currentStatus?: string;
    draft?: string;
    createdBy?: number;
    createdAt?: string;
  };
  timeline: TimelineEntry[];
}

interface TimelineEntry {
  id: number;
  userId: number;
  roleType: string;
  message?: string;
  currentStatus?: string;
  status?: string;
  createdOn: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'default', submitted: 'warning', under_review: 'info',
  pillar_review: 'info', plant_review: 'info',
  approved: 'success', rejected: 'danger', revision: 'primary',
};

const ACTION_COLOR: Record<string, string> = {
  approved: 'success', rejected: 'danger', revision: 'info', submitted: 'warning',
};

const ROLE_LABELS: Record<string, string> = {
  initiator: 'Initiator', section_head: 'Section Head',
  pillar_head: 'Pillar Head', plant_head: 'Plant Head',
};

export default function KaizenDetailPage() {
  const params = useParams<{ id: string }>();
  const [userId, setUserId] = useState<number | null>(null);
  const [data, setData] = useState<KaizenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAction, setShowAction] = useState(false);
  const [actionForm, setActionForm] = useState({ action: 'approved', message: '', roleType: 'section_head' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [me, detail] = await Promise.all([
          apiFetch<{ id: number }>('/auth/me'),
          apiFetch<KaizenDetail>(`/kaizen/${params.id}`),
        ]);
        setUserId(me.id);
        setData(detail);
      } catch {}
      setLoading(false);
    })();
  }, [params.id]);

  async function handleSubmit() {
    if (!userId) return;
    await apiFetch(`/kaizen/${params.id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    const updated = await apiFetch<KaizenDetail>(`/kaizen/${params.id}`);
    setData(updated);
  }

  async function submitAction(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !data) return;
    setSaving(true);
    try {
      await apiFetch(`/kaizen/${params.id}/action`, {
        method: 'POST',
        body: JSON.stringify({ userId, ...actionForm }),
      });
      const updated = await apiFetch<KaizenDetail>(`/kaizen/${params.id}`);
      setData(updated);
      setShowAction(false);
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
        <div className="alert alert-danger">Kaizen not found.</div>
        <Link href="/portal/kaizen" className="btn btn-white btn-sm">Back</Link>
      </div>
    );
  }

  const { kaizen, timeline } = data;
  const status = kaizen.draft === '1' ? 'draft' : (kaizen.currentStatus ?? 'submitted');
  const statusCls = STATUS_COLOR[status] ?? 'default';
  const isOwner = userId === kaizen.createdBy;
  const isDraft = kaizen.draft === '1';
  const canApprove = !isOwner && status !== 'approved' && status !== 'rejected' && status !== 'draft';

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{kaizen.kaizenNo ? `Kaizen ${kaizen.kaizenNo}` : `Kaizen #${kaizen.id}`}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/kaizen">Kaizen</Link></li>
            <li className="active"><strong>{kaizen.kaizenNo ?? `#${kaizen.id}`}</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          {kaizen.type && <span className="label label-info" style={{ fontSize: 12, textTransform: 'capitalize' }}>{kaizen.type}</span>}
          <span className={`label label-${statusCls}`} style={{ fontSize: 12, textTransform: 'capitalize' }}>
            {status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>

        {isDraft && isOwner && (
          <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><i className="fa fa-info-circle" style={{ marginRight: 6 }} />This kaizen is saved as draft.</span>
            <button className="btn btn-warning btn-sm" onClick={handleSubmit}>
              <i className="fa fa-paper-plane" style={{ marginRight: 4 }} />Submit for Review
            </button>
          </div>
        )}

        <div className="row">
          <div className="col-lg-8">

            {/* Idea */}
            {kaizen.idea && (
              <div className="ibox float-e-margins">
                <div className="ibox-title"><h5 style={{ margin: 0 }}>Improvement Idea</h5></div>
                <div className="ibox-content">
                  <p style={{ fontSize: 15, lineHeight: 1.8 }}>{kaizen.idea}</p>
                </div>
              </div>
            )}

            {/* Before / After */}
            {(kaizen.imageBefore || kaizen.imageAfter) && (
              <div className="ibox float-e-margins">
                <div className="ibox-title"><h5 style={{ margin: 0 }}>Before & After</h5></div>
                <div className="ibox-content">
                  <div className="row">
                    {kaizen.imageBefore && (
                      <div className="col-sm-6">
                        <p style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: '#888' }}>Before</p>
                        <img src={`/api/uploads/${kaizen.imageBefore}`} alt="Before"
                          style={{ width: '100%', borderRadius: 4, border: '1px solid #eee', maxHeight: 250, objectFit: 'cover' }} />
                        {kaizen.beforeImageRemark && <p style={{ marginTop: 6, fontSize: 13, color: '#666' }}>{kaizen.beforeImageRemark}</p>}
                      </div>
                    )}
                    {kaizen.imageAfter && (
                      <div className="col-sm-6">
                        <p style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: '#888' }}>After</p>
                        <img src={`/api/uploads/${kaizen.imageAfter}`} alt="After"
                          style={{ width: '100%', borderRadius: 4, border: '1px solid #eee', maxHeight: 250, objectFit: 'cover' }} />
                        {kaizen.afterImageRemark && <p style={{ marginTop: 6, fontSize: 13, color: '#666' }}>{kaizen.afterImageRemark}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Problem → Counter-measure → Results */}
            {(kaizen.problemDefinition || kaizen.counterMeasure || kaizen.resultBefore || kaizen.resultAfter || kaizen.analysis) && (
              <div className="ibox float-e-margins">
                <div className="ibox-title"><h5 style={{ margin: 0 }}>Problem Analysis</h5></div>
                <div className="ibox-content">
                  {kaizen.problemDefinition && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Problem Definition</label>
                      <p style={{ fontSize: 14, lineHeight: 1.7 }}>{kaizen.problemDefinition}</p>
                    </div>
                  )}
                  {kaizen.counterMeasure && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Counter Measure</label>
                      <p style={{ fontSize: 14, lineHeight: 1.7 }}>{kaizen.counterMeasure}</p>
                    </div>
                  )}
                  <div className="row">
                    {kaizen.resultBefore && (
                      <div className="col-sm-6">
                        <label style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Result — Before</label>
                        <p style={{ fontSize: 14 }}>{kaizen.resultBefore}</p>
                      </div>
                    )}
                    {kaizen.resultAfter && (
                      <div className="col-sm-6">
                        <label style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Result — After</label>
                        <p style={{ fontSize: 14 }}>{kaizen.resultAfter}</p>
                      </div>
                    )}
                  </div>
                  {kaizen.analysis && (
                    <div>
                      <label style={{ fontSize: 12, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Analysis</label>
                      <p style={{ fontSize: 14, lineHeight: 1.7 }}>{kaizen.analysis}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>Approval Timeline <small style={{ color: '#999' }}>({timeline.length})</small></h5>
                </div>
                <div className="ibox-content" style={{ padding: 0 }}>
                  {timeline.map((t, i) => (
                    <div key={t.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: i < timeline.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1ab394', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fa fa-user" style={{ color: '#fff', fontSize: 13 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div>
                            <strong style={{ fontSize: 13 }}>Employee #{t.userId}</strong>
                            {t.roleType && <span className="label label-default" style={{ marginLeft: 6, fontSize: 10 }}>{ROLE_LABELS[t.roleType] ?? t.roleType}</span>}
                          </div>
                          <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(t.createdOn).toLocaleString()}</span>
                        </div>
                        {t.status && <span className={`label label-${ACTION_COLOR[t.status] ?? 'default'}`} style={{ marginBottom: 4, display: 'inline-block', textTransform: 'capitalize' }}>{t.status}</span>}
                        {t.message && <p style={{ margin: '4px 0 0', fontSize: 14 }}>{t.message}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval form */}
            {canApprove && (
              <div className="ibox float-e-margins">
                <div className="ibox-title"><h5 style={{ margin: 0 }}>Take Action</h5></div>
                <div className="ibox-content">
                  {!showAction ? (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAction(true)}>
                      <i className="fa fa-gavel" style={{ marginRight: 4 }} />Review
                    </button>
                  ) : (
                    <form onSubmit={submitAction}>
                      <div className="row">
                        <div className="col-sm-4">
                          <div className="form-group">
                            <label>Your Role</label>
                            <select className="form-control" value={actionForm.roleType}
                              onChange={e => setActionForm(f => ({ ...f, roleType: e.target.value }))}>
                              <option value="section_head">Section Head</option>
                              <option value="pillar_head">Pillar Head</option>
                              <option value="plant_head">Plant Head</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="form-group">
                            <label>Decision</label>
                            <select className="form-control" value={actionForm.action}
                              onChange={e => setActionForm(f => ({ ...f, action: e.target.value }))}>
                              <option value="approved">Approve</option>
                              <option value="rejected">Reject</option>
                              <option value="revision">Request Revision</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <div className="form-group">
                            <label>Comments</label>
                            <textarea className="form-control" rows={2} value={actionForm.message}
                              onChange={e => setActionForm(f => ({ ...f, message: e.target.value }))} />
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

          {/* Info panel */}
          <div className="col-lg-4">
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Kaizen Info</h5></div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {[
                  { label: 'Kaizen No.', value: kaizen.kaizenNo ?? '—' },
                  { label: 'Status', value: <span className={`label label-${statusCls}`}>{status.replace(/_/g, ' ')}</span> },
                  { label: 'Type', value: kaizen.type ?? '—' },
                  { label: 'Saving Type', value: kaizen.savingType ?? '—' },
                  { label: 'Annual Benefit', value: kaizen.annualBenefits ? `₹${Number(kaizen.annualBenefits).toLocaleString()}` : '—' },
                  { label: 'Investment', value: kaizen.investment ? `₹${Number(kaizen.investment).toLocaleString()}` : '—' },
                  { label: 'Start Date', value: kaizen.startDate ?? '—' },
                  { label: 'End Date', value: kaizen.endDate ?? '—' },
                  { label: 'Created By', value: `Employee #${kaizen.createdBy}` },
                  { label: 'Created', value: kaizen.createdAt ? new Date(kaizen.createdAt).toLocaleDateString() : '—' },
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

        <Link href="/portal/kaizen" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to Kaizen
        </Link>
      </div>
    </>
  );
}
