'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/auth';

interface QaRequest {
  id: number;
  title?: string;
  departmentId?: number;
  plantId?: number;
  alertReason?: string;
  line?: string;
  alertDate?: string;
  shift?: string;
  frameNumber?: string;
  status?: string;
  createdBy?: number;
  createdAt?: string;
}

interface QaTimeline {
  id: number;
  requestId: number;
  actionType?: string;
  remark?: string;
  userId?: number;
  createdAt?: string;
}

type View = 'list' | 'detail' | 'create';

// Keys match the qa_request.status enum exactly so badges colorize correctly.
const STATUS_META: Record<string, { label: string; color: string }> = {
  'Pending':              { label: 'Pending',      color: '#f39c12' },
  'Pending For Approval': { label: 'Awaiting',     color: '#1c84c6' },
  'Approved':             { label: 'Approved',     color: '#1ab394' },
  'Rejected':             { label: 'Rejected',     color: '#ed5565' },
  'Closed':               { label: 'Closed',       color: '#95a5a6' },
};

function statusBadge(status?: string) {
  const meta = STATUS_META[status ?? ''] ?? { label: status ?? '—', color: '#95a5a6' };
  return (
    <span style={{ background: meta.color + '22', color: meta.color, borderRadius: 3, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
      {meta.label}
    </span>
  );
}

export default function QualityAlertPage() {
  const [requests, setRequests] = useState<QaRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [detail, setDetail] = useState<{ request: QaRequest; timeline: QaTimeline[] } | null>(null);

  // Create form state
  const [form, setForm] = useState({ title: '', alertReason: '', line: '', shift: '', frameNumber: '', alertDate: '', plantId: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const PAGE_SIZE = 20;

  function loadList(p = 1) {
    setLoading(true);
    apiFetch<{ items: QaRequest[]; total: number }>(`/quality-alert/requests?page=${p}&pageSize=${PAGE_SIZE}`)
      .then(r => {
        setRequests(r.items ?? []);
        setTotal(r.total ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadList(page); }, [page]);

  async function openDetail(id: number) {
    const d = await apiFetch<{ request: QaRequest; timeline: QaTimeline[] }>(`/quality-alert/requests/${id}`).catch(() => null);
    if (d) { setDetail({ request: d.request, timeline: d.timeline ?? [] }); setView('detail'); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await apiFetch('/quality-alert/requests', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          alertReason: form.alertReason,
          line: form.line,
          shift: form.shift,
          frameNumber: form.frameNumber,
          alertDate: form.alertDate,
          plantId: form.plantId ? +form.plantId : undefined,
          departmentId: 1,
        }),
      });
      setForm({ title: '', alertReason: '', line: '', shift: '', frameNumber: '', alertDate: '', plantId: '' });
      setView('list');
      loadList(1);
    } catch { setCreateError('Failed to create alert. Please try again.'); }
    setCreating(false);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      {/* Header */}
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h5>
                <i className="fa fa-exclamation-triangle" style={{ marginRight: 8, color: '#e2231a' }} />
                Quality Alert
              </h5>
              <div style={{ display: 'flex', gap: 8 }}>
                {view !== 'list' && (
                  <button onClick={() => setView('list')} style={btnStyle('#676a6c')}>
                    <i className="fa fa-arrow-left" style={{ marginRight: 5 }} />Back
                  </button>
                )}
                {view === 'list' && (
                  <button onClick={() => setView('create')} style={btnStyle('#e2231a')}>
                    <i className="fa fa-plus" style={{ marginRight: 5 }} />New Alert
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List view */}
      {view === 'list' && (
        <div className="row">
          <div className="col-lg-12">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <i className="fa fa-spinner fa-spin" style={{ fontSize: 24, color: '#e2231a' }} />
              </div>
            ) : requests.length === 0 ? (
              <div className="ibox float-e-margins">
                <div className="ibox-content" style={{ textAlign: 'center', padding: '50px 0', color: '#aaa' }}>
                  <i className="fa fa-exclamation-triangle" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
                  No quality alerts found.
                </div>
              </div>
            ) : (
              <div className="ibox float-e-margins">
                <div className="ibox-content" style={{ padding: 0 }}>
                  <div className="table-responsive">
                    <table className="table table-hover" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                          <th style={th}>#</th>
                          <th style={th}>Title</th>
                          <th style={th}>Line</th>
                          <th style={th}>Alert Date</th>
                          <th style={th}>Shift</th>
                          <th style={th}>Status</th>
                          <th style={th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(r => (
                          <tr key={r.id}>
                            <td style={td}>{r.id}</td>
                            <td style={{ ...td, maxWidth: 250 }}>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</div>
                              {r.alertReason && <div style={{ fontSize: 11, color: '#888' }}>{r.alertReason.slice(0, 80)}</div>}
                            </td>
                            <td style={td}>{r.line ?? '—'}</td>
                            <td style={td}>{r.alertDate ?? '—'}</td>
                            <td style={td}>{r.shift ?? '—'}</td>
                            <td style={td}>{statusBadge(r.status)}</td>
                            <td style={td}>
                              <button onClick={() => openDetail(r.id)} style={btnStyle('#1c84c6', true)}>
                                <i className="fa fa-eye" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ padding: '12px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={btnStyle('#aaa', true)}>
                        <i className="fa fa-chevron-left" />
                      </button>
                      <span style={{ fontSize: 13, color: '#555' }}>Page {page} of {totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={btnStyle('#aaa', true)}>
                        <i className="fa fa-chevron-right" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail view */}
      {view === 'detail' && detail && (
        <div className="row">
          <div className="col-md-8">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5>Alert #{detail.request.id} — {detail.request.title}</h5>
                <div style={{ float: 'right', marginTop: -4 }}>{statusBadge(detail.request.status)}</div>
              </div>
              <div className="ibox-content">
                <dl className="dl-horizontal" style={{ marginBottom: 0 }}>
                  {detail.request.alertReason && <><dt style={dtS}>Reason</dt><dd style={ddS}>{detail.request.alertReason}</dd></>}
                  {detail.request.line && <><dt style={dtS}>Line</dt><dd style={ddS}>{detail.request.line}</dd></>}
                  {detail.request.shift && <><dt style={dtS}>Shift</dt><dd style={ddS}>{detail.request.shift}</dd></>}
                  {detail.request.frameNumber && <><dt style={dtS}>Frame #</dt><dd style={ddS}>{detail.request.frameNumber}</dd></>}
                  {detail.request.alertDate && <><dt style={dtS}>Alert Date</dt><dd style={ddS}>{detail.request.alertDate}</dd></>}
                </dl>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5><i className="fa fa-history" style={{ marginRight: 8 }} />Timeline</h5></div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {detail.timeline.length === 0 ? (
                  <p style={{ padding: '16px', color: '#aaa', fontSize: 13 }}>No activity yet.</p>
                ) : (
                  detail.timeline.map(t => (
                    <div key={t.id} style={{ padding: '10px 16px', borderBottom: '1px solid #f4f4f4' }}>
                      {t.actionType && <span style={{ fontSize: 11, fontWeight: 700, color: '#1c84c6', textTransform: 'uppercase' }}>{t.actionType}</span>}
                      {t.remark && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>{t.remark}</p>}
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      {view === 'create' && (
        <div className="row">
          <div className="col-md-8 col-md-offset-2">
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5><i className="fa fa-plus" style={{ marginRight: 8 }} />New Quality Alert</h5></div>
              <div className="ibox-content">
                <form onSubmit={handleCreate}>
                  <FormField label="Title *">
                    <input className="form-control" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </FormField>
                  <FormField label="Alert Reason">
                    <textarea className="form-control" rows={3} value={form.alertReason} onChange={e => setForm(f => ({ ...f, alertReason: e.target.value }))} />
                  </FormField>
                  <div className="row">
                    <div className="col-md-6"><FormField label="Line">
                      <input className="form-control" value={form.line} onChange={e => setForm(f => ({ ...f, line: e.target.value }))} />
                    </FormField></div>
                    <div className="col-md-6"><FormField label="Shift">
                      <input className="form-control" value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))} />
                    </FormField></div>
                  </div>
                  <div className="row">
                    <div className="col-md-6"><FormField label="Frame Number">
                      <input className="form-control" value={form.frameNumber} onChange={e => setForm(f => ({ ...f, frameNumber: e.target.value }))} />
                    </FormField></div>
                    <div className="col-md-6"><FormField label="Alert Date">
                      <input className="form-control" type="date" value={form.alertDate} onChange={e => setForm(f => ({ ...f, alertDate: e.target.value }))} />
                    </FormField></div>
                  </div>
                  {createError && (
                    <div style={{ background: '#fff3f3', border: '1px solid #f5c6cb', borderRadius: 4, padding: '8px 14px', fontSize: 13, color: '#721c24', marginBottom: 12 }}>
                      <i className="fa fa-exclamation-circle" style={{ marginRight: 8 }} />{createError}
                    </div>
                  )}
                  <button type="submit" disabled={creating} style={{ ...btnStyle('#e2231a'), marginTop: 8 }}>
                    {creating ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Submitting…</> : 'Submit Alert'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#555' };
const td: React.CSSProperties = { padding: '10px 16px', verticalAlign: 'middle', fontSize: 13 };
const dtS: React.CSSProperties = { width: 90, fontSize: 12, color: '#999', fontWeight: 600, paddingTop: 8 };
const ddS: React.CSSProperties = { marginLeft: 100, fontSize: 13, paddingTop: 8, borderTop: '1px solid #f4f4f4' };

function btnStyle(color: string, small?: boolean): React.CSSProperties {
  return {
    background: color, color: '#fff', border: 'none', borderRadius: 3,
    padding: small ? '4px 10px' : '8px 18px',
    fontSize: small ? 12 : 13, fontWeight: 600, cursor: 'pointer',
  };
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group" style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}
