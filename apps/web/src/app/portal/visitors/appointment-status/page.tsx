'use client';
/**
 * /portal/visitors/appointment-status — Visitors Pending for Card.
 *
 * Pixel-faithful port of legacy /visitors/appointment-status.html. Lists
 * approved appointments whose visitors haven't been issued a gate-pass card
 * yet (no `visitor_checkin` row). Each table row is one (visitor, appointment).
 *
 * Columns: Photo • Name • Mobile • Organization • Appointment Start •
 *          Location • Entry Gate • Appointment End • Status • Action
 * Action: View detail + Delete (cancels the parent appointment).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Row {
  id: number;
  appointmentId: number;
  visitorId: number;
  visitorName?: string;
  visitorMobile?: string;
  visitorEmail?: string;
  company?: string;
  locationName?: string;
  visitorLocationId?: number;
  appStartDate?: string;
  appEndDate?: string;
  gateName?: string;
  passType?: string;
  requestStatus?: string;
}

const STATUS_BADGE: Record<string, string> = {
  approved: 'success', pending: 'warning', rejected: 'danger', cancelled: 'default',
};

export default function AppointmentStatusPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [pageIndex, setPageIndex] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null); // appointmentId

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch<Row[]>('/visitors/appointments/pending-card');
      setRows(Array.isArray(r) ? r : []);
    } catch { setRows([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      (r.visitorName ?? '').toLowerCase().includes(s) ||
      (r.visitorMobile ?? '').includes(s) ||
      (r.company ?? '').toLowerCase().includes(s) ||
      (r.locationName ?? '').toLowerCase().includes(s),
    );
  }, [rows, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageStart = (pageIndex - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);
  useEffect(() => { if (pageIndex > pageCount) setPageIndex(1); }, [pageCount, pageIndex]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await apiFetch(`/visitors/appointments/${pendingDelete}/cancel`, { method: 'PUT' });
      setPendingDelete(null);
      await load();
    } catch {}
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-12">
          <h2>Visitors Pending for Card</h2>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h5 style={{ margin: 0, flex: 1 }}>
              <i className="fa fa-id-card" style={{ marginRight: 8, color: '#1ab394' }} />
              Pending Card Issuance ({filtered.length})
            </h5>
            <input
              className="form-control input-sm"
              placeholder="Search visitor / company / mobile…"
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
                      <th style={{ width: 70 }}>Visitor Photo</th>
                      <th>Visitor Name</th>
                      <th>Visitor Mobile</th>
                      <th>Visitor Organization</th>
                      <th>Appointment Start</th>
                      <th>Location</th>
                      <th>Entry Gate</th>
                      <th>Appointment End</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', color: '#aaa', padding: 30 }}>
                          No data available in table
                        </td>
                      </tr>
                    ) : pageRows.map((r) => (
                      <tr key={`${r.appointmentId}-${r.visitorId}`}>
                        <td>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa fa-user" style={{ color: '#aaa' }} />
                          </div>
                        </td>
                        <td><strong>{r.visitorName ?? '—'}</strong></td>
                        <td>{r.visitorMobile ?? '—'}</td>
                        <td>{r.company ?? '—'}</td>
                        <td>{r.appStartDate ?? '—'}</td>
                        <td>{r.locationName ?? '—'}</td>
                        <td>{r.gateName ?? '—'}</td>
                        <td>{r.appEndDate ?? '—'}</td>
                        <td>
                          <span className={`label label-${STATUS_BADGE[r.requestStatus ?? ''] ?? 'default'}`} style={{ textTransform: 'capitalize' }}>
                            {r.requestStatus ?? '—'}
                          </span>
                        </td>
                        <td>
                          <div className="btns-texts" style={{ display: 'flex', gap: 4 }}>
                            <Link
                              href={`/portal/visitors/appointment/${r.appointmentId}`}
                              className="btn btn-white btn-xs"
                            >
                              <i className="fa fa-eye" /> View
                            </Link>
                            <button
                              className="btn btn-danger btn-xs"
                              onClick={() => setPendingDelete(r.appointmentId)}
                            >
                              <i className="fa fa-close" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

      {/* Delete confirm */}
      {pendingDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }} onClick={() => setPendingDelete(null)}>
          <div style={{ background: '#fff', borderRadius: 6, padding: 24, maxWidth: 360, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 56, color: '#ed5565', marginBottom: 12 }}>
              <i className="fa fa-exclamation-triangle" />
            </div>
            <h2 style={{ margin: '8px 0' }}>Are you sure?</h2>
            <p style={{ color: '#777' }}>You want to delete this appointment.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <button className="btn btn-default" onClick={() => setPendingDelete(null)}>Close</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
