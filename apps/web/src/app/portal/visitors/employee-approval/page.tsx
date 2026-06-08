'use client';
/**
 * /portal/visitors/employee-approval — Visitor Pending for Employee Approval.
 *
 * Pixel-faithful port of legacy /visitors/employee-approval.html. Lists every
 * appointment where the logged-in user is the contact_person (host) and the
 * request is still in `pending` state. The host can:
 *   • Approve  → PUT /v2/visitors/appointments/:id/approve { approved:true }
 *   • Reject   → PUT /v2/visitors/appointments/:id/approve { approved:false } + reason
 *
 * Columns: Visitor's Name • Host Name • Organization • Location •
 *          Appointment Start • Appointment End • Pass Type • Entry Gate •
 *          Request From • Action
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/auth';

interface PendingAppt {
  appointmentId: number;
  visitors: Array<{ id: number; visitorName?: string; mobile?: string; visitorEmail?: string }>;
  company?: string;
  contactPerson?: number;
  visitorLocationId?: number;
  locationName?: string;
  validFromDate?: string;
  validFromTime?: string;
  validToDate?: string;
  validToTime?: string;
  passType?: string;
  gateName?: string;
  requestStatus?: string;
  requestCreatedBy?: string;
  passApprover?: number | null;
}

const PASS_COLORS: Record<string, string> = {
  green: 'success', yellow: 'warning', red: 'danger', blue: 'primary',
};

export default function EmployeeApprovalPage() {
  const [rows, setRows] = useState<PendingAppt[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [q, setQ] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [pageIndex, setPageIndex] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectFor, setRejectFor] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await apiFetch<{ id: number; name?: string }>('/auth/me');
      setUserId(me.id);
      setUserName(me.name ?? '');
      const r = await apiFetch<PendingAppt[]>('/visitors/appointments/pending-approval');
      setRows(Array.isArray(r) ? r : []);
    } catch { setRows([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      (r.company ?? '').toLowerCase().includes(s) ||
      (r.locationName ?? '').toLowerCase().includes(s) ||
      r.visitors.some((v) => (v.visitorName ?? '').toLowerCase().includes(s) || (v.mobile ?? '').includes(s)),
    );
  }, [rows, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageStart = (pageIndex - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);
  useEffect(() => { if (pageIndex > pageCount) setPageIndex(1); }, [pageCount, pageIndex]);

  async function approve(apptId: number) {
    if (!userId) return;
    setBusyId(apptId);
    try {
      await apiFetch(`/visitors/appointments/${apptId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ approverId: userId, approved: true }),
      });
      await load();
    } catch {} finally { setBusyId(null); }
  }

  async function reject() {
    if (!userId || rejectFor == null) return;
    setBusyId(rejectFor);
    try {
      await apiFetch(`/visitors/appointments/${rejectFor}/approve`, {
        method: 'PUT',
        body: JSON.stringify({
          approverId: userId,
          approved: false,
          remarks: rejectReason.trim() || null,
        }),
      });
      setRejectFor(null);
      setRejectReason('');
      await load();
    } catch {} finally { setBusyId(null); }
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-12">
          <h2>Visitor Pending for Employee Approval</h2>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h5 style={{ margin: 0, flex: 1 }}>
              <i className="fa fa-check-circle" style={{ marginRight: 8, color: '#1ab394' }} />
              Awaiting Your Approval ({filtered.length})
            </h5>
            <input
              className="form-control input-sm"
              placeholder="Search visitor / company…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPageIndex(1); }}
              style={{ width: 280 }}
            />
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Visitor&apos;s Name</th>
                      <th>Host Name</th>
                      <th>Visitor&apos;s Organization</th>
                      <th>Visitor&apos;s Location</th>
                      <th>Appointment Start</th>
                      <th>Appointment End</th>
                      <th>Pass Type</th>
                      <th>Entry Gate</th>
                      <th>Request From</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', color: '#aaa', padding: 30 }}>
                          No appointments awaiting your approval.
                        </td>
                      </tr>
                    ) : pageRows.map((r) => {
                      const start = `${r.validFromDate ?? ''} ${r.validFromTime ?? ''}`.trim();
                      const end   = `${r.validToDate ?? ''} ${r.validToTime ?? ''}`.trim();
                      return (
                        <tr key={r.appointmentId}>
                          <td>
                            {r.visitors.length === 0 ? '—' : r.visitors.map((v, i) => (
                              <div key={v.id ?? i} style={{ fontSize: 12 }}>
                                <strong>{v.visitorName ?? '—'}</strong>
                                {v.mobile && <span style={{ color: '#888', marginLeft: 6 }}>· {v.mobile}</span>}
                              </div>
                            ))}
                          </td>
                          <td>{userName}</td>
                          <td>{r.company ?? '—'}</td>
                          <td>{r.locationName ?? '—'}</td>
                          <td>{start || '—'}</td>
                          <td>{end || '—'}</td>
                          <td>
                            {r.passType ? (
                              <span className={`label label-${PASS_COLORS[r.passType?.toLowerCase()] ?? 'default'}`} style={{ textTransform: 'capitalize' }}>
                                {r.passType}
                              </span>
                            ) : '—'}
                          </td>
                          <td>{r.gateName ?? '—'}</td>
                          <td style={{ fontSize: 12, color: '#777' }}>
                            {r.requestCreatedBy === 'visitor' || r.requestCreatedBy === 'app'
                              ? <span className="label label-info">Visitor App</span>
                              : 'Self / Host'}
                          </td>
                          <td>
                            <div className="btns-texts" style={{ display: 'flex', gap: 4 }}>
                              <button
                                className="btn btn-primary btn-xs"
                                disabled={busyId === r.appointmentId}
                                onClick={() => approve(r.appointmentId)}
                              >
                                {busyId === r.appointmentId
                                  ? <><i className="fa fa-spinner fa-spin" /> …</>
                                  : <><i className="fa fa-check" /> Approve</>}
                              </button>
                              <button
                                className="btn btn-danger btn-xs"
                                disabled={busyId === r.appointmentId}
                                onClick={() => { setRejectFor(r.appointmentId); setRejectReason(''); }}
                              >
                                <i className="fa fa-times" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#888' }}>
                  Showing {pageStart + 1} to {Math.min(pageStart + pageSize, filtered.length)} of {filtered.length} entries
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <select
                    className="form-control input-sm"
                    style={{ width: 80 }}
                    value={pageSize}
                    onChange={(e) => { setPageSize(+e.target.value); setPageIndex(1); }}
                  >
                    {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button className="btn btn-white btn-xs" disabled={pageIndex <= 1} onClick={() => setPageIndex((p) => p - 1)}>
                    <i className="fa fa-chevron-left" />
                  </button>
                  <span style={{ fontSize: 12 }}>Page {pageIndex} / {pageCount}</span>
                  <button className="btn btn-white btn-xs" disabled={pageIndex >= pageCount} onClick={() => setPageIndex((p) => p + 1)}>
                    <i className="fa fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject modal with optional remarks */}
      {rejectFor !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }} onClick={() => setRejectFor(null)}>
          <div style={{ background: '#fff', borderRadius: 6, padding: 24, maxWidth: 420, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <i className="fa fa-times-circle" style={{ fontSize: 32, color: '#ed5565' }} />
              <h3 style={{ margin: 0 }}>Reject appointment</h3>
            </div>
            <p style={{ color: '#777', fontSize: 13 }}>
              Please add an optional note for the visitor explaining the reason.
            </p>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Reason (optional)…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-default" onClick={() => setRejectFor(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={reject} disabled={busyId === rejectFor}>
                {busyId === rejectFor ? <><i className="fa fa-spinner fa-spin" /> …</> : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
