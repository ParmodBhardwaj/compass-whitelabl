'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface OplDetail {
  opl: {
    id: number;
    oplNo?: string;
    language?: string;
    plantId?: number;
    pillarId?: number;
    topicId?: number;
    applicationId?: number;
    description?: string;
    knowWhy?: string;
    firstPhoto?: string;
    secondPhoto?: string;
    remarksFirst?: string;
    remarksSecond?: string;
    status?: string;
    isDraft?: string;
    step?: string;
    type?: string;
    classificationType?: string;
    familyWise?: string;
    circleWise?: string;
    createdBy?: number;
    createdAt?: string;
    modifiedAt?: string;
  };
  actions: ActionEntry[];
}

interface ActionEntry {
  id: number;
  oplId: number;
  actionBy: number;
  action: string;
  remarks?: string;
  step?: string;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'default', pending: 'warning', approved: 'success', rejected: 'danger', revision: 'info',
};

const ACTION_COLOR: Record<string, string> = {
  approved: 'success', rejected: 'danger', revision: 'info',
};

export default function OplDetailPage() {
  const params = useParams<{ id: string }>();
  const [userId, setUserId] = useState<number | null>(null);
  const [data, setData] = useState<OplDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAction, setShowAction] = useState(false);
  const [actionForm, setActionForm] = useState({ action: 'approved', remarks: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [me, detail] = await Promise.all([
          apiFetch<{ id: number }>('/auth/me'),
          apiFetch<OplDetail>(`/tpm/opl/${params.id}`),
        ]);
        setUserId(me.id);
        setData(detail);
      } catch {}
      setLoading(false);
    })();
  }, [params.id]);

  async function submitAction(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !data) return;
    setSaving(true);
    try {
      await apiFetch(`/tpm/opl/${params.id}/action`, {
        method: 'POST',
        body: JSON.stringify({
          actionBy: userId,
          action: actionForm.action,
          remarks: actionForm.remarks,
          step: data.opl.step ?? '1',
        }),
      });
      const updated = await apiFetch<OplDetail>(`/tpm/opl/${params.id}`);
      setData(updated);
      setShowAction(false);
      setActionForm({ action: 'approved', remarks: '' });
    } catch {}
    setSaving(false);
  }

  async function handleSubmit() {
    await apiFetch(`/tpm/opl/${params.id}/submit`, { method: 'POST' });
    const updated = await apiFetch<OplDetail>(`/tpm/opl/${params.id}`);
    setData(updated);
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
        <div className="alert alert-danger">OPL not found.</div>
        <Link href="/portal/tpm/opl" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back
        </Link>
      </div>
    );
  }

  const { opl, actions } = data;
  const status = opl.isDraft === '1' ? 'draft' : (opl.status ?? 'draft');
  const statusCls = STATUS_COLOR[status] ?? 'default';
  const isOwner = userId === opl.createdBy;
  const isDraft = opl.isDraft === '1';
  const canApprove = !isOwner && opl.status === 'pending';

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{opl.oplNo ? `OPL ${opl.oplNo}` : `OPL #${opl.id}`}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/tpm/opl">OPL</Link></li>
            <li className="active"><strong>{opl.oplNo ?? `#${opl.id}`}</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          {opl.type && <span className="label label-info" style={{ fontSize: 12 }}>{opl.type}</span>}
          <span className={`label label-${statusCls}`} style={{ fontSize: 12, textTransform: 'capitalize' }}>{status}</span>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>

        {/* Action bar */}
        {(isDraft && isOwner) && (
          <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><i className="fa fa-info-circle" style={{ marginRight: 6 }} />This OPL is saved as draft. Submit it for approval when ready.</span>
            <button className="btn btn-warning btn-sm" onClick={handleSubmit}>
              <i className="fa fa-paper-plane" style={{ marginRight: 4 }} />Submit for Approval
            </button>
          </div>
        )}

        <div className="row">
          <div className="col-lg-8">

            {/* Before / After photos */}
            {(opl.firstPhoto || opl.secondPhoto) && (
              <div className="ibox float-e-margins">
                <div className="ibox-title"><h5 style={{ margin: 0 }}>Before & After</h5></div>
                <div className="ibox-content">
                  <div className="row">
                    {opl.firstPhoto && (
                      <div className="col-sm-6">
                        <p style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Before</p>
                        <img src={`/api/uploads/${opl.firstPhoto}`} alt="Before"
                          style={{ width: '100%', borderRadius: 4, border: '1px solid #eee', maxHeight: 250, objectFit: 'cover' }} />
                        {opl.remarksFirst && <p style={{ marginTop: 8, fontSize: 13, color: '#666' }}>{opl.remarksFirst}</p>}
                      </div>
                    )}
                    {opl.secondPhoto && (
                      <div className="col-sm-6">
                        <p style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>After</p>
                        <img src={`/api/uploads/${opl.secondPhoto}`} alt="After"
                          style={{ width: '100%', borderRadius: 4, border: '1px solid #eee', maxHeight: 250, objectFit: 'cover' }} />
                        {opl.remarksSecond && <p style={{ marginTop: 8, fontSize: 13, color: '#666' }}>{opl.remarksSecond}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Description</h5></div>
              <div className="ibox-content">
                {opl.description ? (
                  <p style={{ fontSize: 15, lineHeight: 1.8 }}>{opl.description}</p>
                ) : (
                  <p className="text-muted">No description provided.</p>
                )}
                {opl.knowWhy && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0f8ff', borderLeft: '4px solid #3498db', borderRadius: 3 }}>
                    <strong style={{ fontSize: 12, textTransform: 'uppercase', color: '#888' }}>Know Why:</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 14 }}>{opl.knowWhy}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Approval actions */}
            {actions.length > 0 && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>Approval History <small style={{ color: '#999' }}>({actions.length})</small></h5>
                </div>
                <div className="ibox-content" style={{ padding: 0 }}>
                  {actions.map(a => (
                    <div key={a.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f0f0f0', alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fa fa-user" style={{ color: '#aaa', fontSize: 13 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13 }}>Employee #{a.actionBy} {a.step ? `(Step ${a.step})` : ''}</span>
                          <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <span className={`label label-${ACTION_COLOR[a.action] ?? 'default'}`} style={{ textTransform: 'capitalize' }}>{a.action}</span>
                        </div>
                        {a.remarks && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>{a.remarks}</p>}
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
                      <i className="fa fa-gavel" style={{ marginRight: 4 }} />Review & Approve
                    </button>
                  ) : (
                    <form onSubmit={submitAction}>
                      <div className="form-group">
                        <label>Decision</label>
                        <select className="form-control" value={actionForm.action}
                          onChange={e => setActionForm(f => ({ ...f, action: e.target.value }))}>
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                          <option value="revision">Request Revision</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Remarks</label>
                        <textarea className="form-control" rows={3} value={actionForm.remarks}
                          onChange={e => setActionForm(f => ({ ...f, remarks: e.target.value }))}
                          placeholder="Add your comments..." />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                          {saving ? <i className="fa fa-spinner fa-spin" /> : 'Submit Decision'}
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
              <div className="ibox-title"><h5 style={{ margin: 0 }}>OPL Info</h5></div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {[
                  { label: 'OPL No.', value: opl.oplNo ?? '—' },
                  { label: 'Status', value: <span className={`label label-${statusCls}`}>{status}</span> },
                  { label: 'Type', value: opl.type ?? '—' },
                  { label: 'Language', value: opl.language ?? 'en' },
                  { label: 'Classification', value: opl.classificationType ?? '—' },
                  { label: 'Family', value: opl.familyWise ?? '—' },
                  { label: 'Circle', value: opl.circleWise ?? '—' },
                  { label: 'Created By', value: `Employee #${opl.createdBy}` },
                  { label: 'Created', value: opl.createdAt ? new Date(opl.createdAt).toLocaleDateString() : '—' },
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

        <Link href="/portal/tpm/opl" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to OPL
        </Link>
      </div>
    </>
  );
}
