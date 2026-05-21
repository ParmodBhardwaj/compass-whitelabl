'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';
import { FileUpload } from '@/components/admin/FileUpload';

interface AuditMeta {
  id: number;
  uniqueNumber?: string;
  name?: string;
  functionAudit?: string;
  financialYear?: string;
  status?: string;
  createdOn?: string;
}

interface AuditSection {
  id: number;
  auditId?: number;
  sectionName?: string;
  observationDetail?: string;
  immediateActionPlan?: string;
  systematicActionPlan?: string;
  processOwner?: number;
  riskRating?: string;
  timeline?: string;
  status?: string;
  sortOrder?: number;
}

interface AuditDetail {
  audit: AuditMeta;
  sections: AuditSection[];
}

interface AuthUser {
  id: number;
  email: string;
  name?: string;
  roles?: string[];
}

const STATUS_COLOR: Record<string, string> = {
  'Implemented': 'success',
  'Partially Implemented': 'warning',
  'Not Implemented': 'danger',
};

const RISK_COLOR: Record<string, string> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'default',
};

export default function AuditDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<AuditDetail | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Evidence submission state
  const [evidenceSection, setEvidenceSection] = useState<AuditSection | null>(null);
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<Array<{ url: string; filename: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<AuthUser>('/auth/me'),
      apiFetch<AuditDetail>(`/audit/${params.id}`),
    ]).then(([u, d]) => {
      setUser(u);
      setData(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [params.id]);

  async function submitEvidence() {
    if (!evidenceSection || !comment.trim()) {
      setMsg({ type: 'danger', text: 'Please add a comment.' });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/audit/evidence', {
        method: 'POST',
        body: JSON.stringify({
          sectionId: evidenceSection.id,
          userId: user?.id,
          comment,
          attachments: attachments.map(a => ({ filename: a.filename, path: a.url })),
        }),
      });
      setMsg({ type: 'success', text: 'Evidence submitted successfully.' });
      setEvidenceSection(null);
      setComment('');
      setAttachments([]);
      // Refresh audit detail
      const refreshed = await apiFetch<AuditDetail>(`/audit/${params.id}`);
      setData(refreshed);
    } catch {
      setMsg({ type: 'danger', text: 'Error submitting evidence.' });
    } finally { setSubmitting(false); }
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
        <div className="alert alert-danger">Audit not found or access denied.</div>
        <Link href="/portal/audit" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back
        </Link>
      </div>
    );
  }

  const { audit, sections } = data;
  const canSubmitFor = (s: AuditSection) =>
    user && s.processOwner === user.id && s.status !== 'Implemented';

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{audit.name}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/audit">Audit</Link></li>
            <li className="active"><strong>{audit.uniqueNumber}</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {msg && (
          <div className={`alert alert-${msg.type}`} style={{ padding: '8px 16px', marginBottom: 16 }}>
            {msg.text}
            <button type="button" className="close" onClick={() => setMsg(null)} style={{ marginLeft: 8 }}>×</button>
          </div>
        )}

        {/* Audit header */}
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <h5 style={{ margin: 0 }}>Audit Details</h5>
          </div>
          <div className="ibox-content">
            <div className="row">
              <div className="col-sm-3">
                <strong>Unique No.:</strong>
                <p><code>{audit.uniqueNumber}</code></p>
              </div>
              <div className="col-sm-3">
                <strong>Function:</strong>
                <p>{audit.functionAudit}</p>
              </div>
              <div className="col-sm-3">
                <strong>Financial Year:</strong>
                <p>{audit.financialYear}</p>
              </div>
              <div className="col-sm-3">
                <strong>Status:</strong>
                <p>
                  <span className={`label label-${STATUS_COLOR[audit.status ?? ''] ?? 'default'}`}>
                    {audit.status ?? '—'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence submission form (inline) */}
        {evidenceSection && (
          <div className="ibox float-e-margins" style={{ border: '2px solid #1ab394' }}>
            <div className="ibox-title" style={{ background: '#f0faf8' }}>
              <h5 style={{ margin: 0 }}>Submit Evidence — {evidenceSection.sectionName}</h5>
            </div>
            <div className="ibox-content">
              <div className="form-horizontal">
                <div className="form-group">
                  <label className="col-sm-2 control-label">Comment <span className="text-danger">*</span></label>
                  <div className="col-sm-10">
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Describe the evidence / action taken..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-2 control-label">Attachments</label>
                  <div className="col-sm-10">
                    <FileUpload
                      multiple
                      onUploaded={files => setAttachments(prev => [...prev, ...files])}
                    />
                    {attachments.length > 0 && (
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        {attachments.map((a, i) => (
                          <li key={i} style={{ fontSize: 13 }}>
                            <i className="fa fa-file-o" style={{ marginRight: 6 }} />
                            {a.filename}
                            <button
                              type="button"
                              className="btn btn-xs btn-danger"
                              style={{ marginLeft: 8 }}
                              onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                            >×</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  className="btn btn-white btn-sm"
                  onClick={() => { setEvidenceSection(null); setComment(''); setAttachments([]); }}
                >Cancel</button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={submitEvidence}
                  disabled={submitting}
                >
                  <i className="fa fa-upload" style={{ marginRight: 4 }} />
                  {submitting ? 'Submitting…' : 'Submit Evidence'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Observations / Sections */}
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <h5 style={{ margin: 0 }}>
              Observations ({sections.length})
            </h5>
          </div>
          <div className="ibox-content" style={{ padding: 0 }}>
            {sections.length === 0 ? (
              <p className="text-center text-muted" style={{ padding: 30 }}>No observations.</p>
            ) : (
              <table className="table table-hover" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Observation</th>
                    <th style={{ width: 80 }}>Risk</th>
                    <th style={{ width: 110 }}>Timeline</th>
                    <th style={{ width: 160, textAlign: 'center' }}>Status</th>
                    <th style={{ width: 130 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((s, idx) => (
                    <tr key={s.id}>
                      <td style={{ verticalAlign: 'top', paddingTop: 14 }}>{idx + 1}</td>
                      <td style={{ verticalAlign: 'top' }}>
                        <strong>{s.sectionName}</strong>
                        {s.observationDetail && (
                          <p style={{ fontSize: 13, color: '#555', margin: '4px 0 0', lineHeight: 1.4 }}>
                            {s.observationDetail}
                          </p>
                        )}
                        {s.immediateActionPlan && (
                          <div style={{ marginTop: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#1ab394' }}>Immediate: </span>
                            <span style={{ fontSize: 12, color: '#555' }}>{s.immediateActionPlan}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ verticalAlign: 'top', paddingTop: 14 }}>
                        {s.riskRating && (
                          <span className={`label label-${RISK_COLOR[s.riskRating] ?? 'default'}`}>
                            {s.riskRating}
                          </span>
                        )}
                      </td>
                      <td style={{ verticalAlign: 'top', paddingTop: 14, fontSize: 13 }}>
                        {s.timeline && (
                          <>
                            <i className="fa fa-calendar" style={{ marginRight: 4, color: '#aaa' }} />
                            {s.timeline}
                          </>
                        )}
                      </td>
                      <td style={{ verticalAlign: 'top', paddingTop: 12, textAlign: 'center' }}>
                        <span className={`label label-${STATUS_COLOR[s.status ?? ''] ?? 'default'}`}>
                          {s.status ?? 'Not Implemented'}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'top', paddingTop: 10 }}>
                        {canSubmitFor(s) && evidenceSection?.id !== s.id && (
                          <button
                            className="btn btn-xs btn-success"
                            onClick={() => { setEvidenceSection(s); setMsg(null); window.scrollTo(0, 0); }}
                          >
                            <i className="fa fa-upload" style={{ marginRight: 3 }} />Submit Evidence
                          </button>
                        )}
                        {evidenceSection?.id === s.id && (
                          <span className="text-muted" style={{ fontSize: 12 }}>Editing above ↑</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <Link href="/portal/audit" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to Audits
        </Link>
      </div>
    </>
  );
}
