'use client';
/**
 * /portal/visitors/checkout-pending — Visitors Pending for Checkout.
 *
 * Pixel-faithful port of legacy /visitors/checkout-pending.html. Lists
 * visitors who have checked in but haven't checked out yet. One-click
 * "Checkout" closes the per-visitor row (PUT /v2/visitors/visitors/:vid/checkout).
 *
 * Columns: Name • Mobile • Organization • Visited Location •
 *          Appointment Start • Appointment End • Status • Check-in •
 *          Check-out • Action
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
  company?: string;
  locationName?: string;
  appStartDate?: string;
  appEndDate?: string;
  visitorCheckin?: string | null;
  visitorCheckout?: string | null;
  requestStatus?: string;
}

function fmt(dt?: string | null): string {
  if (!dt) return '—';
  try { return new Date(dt).toLocaleString(); } catch { return String(dt); }
}

export default function CheckoutPendingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [pageIndex, setPageIndex] = useState(1);
  const [confirmId, setConfirmId] = useState<number | null>(null); // visitorId being checked out

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch<Row[]>('/visitors/appointments/pending-checkout');
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

  async function doCheckout() {
    if (!confirmId) return;
    setBusyId(confirmId);
    try {
      await apiFetch(`/visitors/visitors/${confirmId}/checkout`, { method: 'PUT' });
      setConfirmId(null);
      await load();
    } catch {} finally { setBusyId(null); }
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-12">
          <h2>Visitors Pending for Checkout</h2>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h5 style={{ margin: 0, flex: 1 }}>
              <i className="fa fa-sign-out" style={{ marginRight: 8, color: '#f8ac59' }} />
              Pending Checkout ({filtered.length})
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
                      <th>Visitor Name</th>
                      <th>Visitor Mobile</th>
                      <th>Visitor Organization</th>
                      <th>Visited Location</th>
                      <th>Appointment Start</th>
                      <th>Appointment End</th>
                      <th>Status</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
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
                        <td><strong>{r.visitorName ?? '—'}</strong></td>
                        <td>{r.visitorMobile ?? '—'}</td>
                        <td>{r.company ?? '—'}</td>
                        <td>{r.locationName ?? '—'}</td>
                        <td>{r.appStartDate ?? '—'}</td>
                        <td>{r.appEndDate ?? '—'}</td>
                        <td>
                          <span className="label label-primary">Checked In</span>
                        </td>
                        <td style={{ color: '#1ab394', fontSize: 12 }}>
                          <i className="fa fa-sign-in" style={{ marginRight: 4 }} />{fmt(r.visitorCheckin)}
                        </td>
                        <td style={{ color: '#aaa', fontSize: 12 }}>—</td>
                        <td>
                          <div className="btns-texts" style={{ display: 'flex', gap: 4 }}>
                            <Link
                              href={`/portal/visitors/appointment/${r.appointmentId}`}
                              className="btn btn-white btn-xs"
                            >
                              <i className="fa fa-eye" /> View
                            </Link>
                            <button
                              className="btn btn-success btn-xs"
                              disabled={busyId === r.visitorId}
                              onClick={() => setConfirmId(r.visitorId)}
                            >
                              {busyId === r.visitorId
                                ? <><i className="fa fa-spinner fa-spin" /> Checking out…</>
                                : <><i className="fa fa-sign-out" /> Check-out</>}
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

      {confirmId !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }} onClick={() => setConfirmId(null)}>
          <div style={{ background: '#fff', borderRadius: 6, padding: 24, maxWidth: 360, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 56, color: '#1ab394', marginBottom: 12 }}>
              <i className="fa fa-sign-out" />
            </div>
            <h2 style={{ margin: '8px 0' }}>Confirm checkout?</h2>
            <p style={{ color: '#777' }}>This will mark the visitor as checked out now.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <button className="btn btn-default" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn btn-success" onClick={doCheckout}>Check out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
