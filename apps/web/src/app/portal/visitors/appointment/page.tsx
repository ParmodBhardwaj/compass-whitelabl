'use client';
/**
 * /portal/visitors/appointment — Manage Visitor Appointment.
 *
 * Pixel-faithful port of the legacy /visitors/appointment.html (module/Visitors/
 * view/visitors/appointment/index.phtml + appointment_table.phtml).
 *
 * Layout:
 *   - "Manage Visitor Appointment" title + red "Add Appointment" button (top right)
 *   - Filter row: Organization dropdown (left), From Date, To Date, Reset
 *   - DataTable: Visitor Name, Organization, Location, Apt Date, Apt Time,
 *     Purpose, Pass Type, Entry Gate, Status, To Date, Appointment Id, Action
 *   - Per-row action: Edit + Delete (only when visitor not yet checked in)
 *   - Status derivation matches legacy:
 *       pending           → "Pending for Approval"
 *       no check-in       → "Pending for Card"
 *       check-in but no check-out → "Pending for Checkout"
 *       both filled       → "Visited"
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Appointment {
  id: number;
  company?: string;
  visitorLocationId?: number;
  purposeOfVisit?: string;
  passType?: string;
  gateName?: string;
  requestStatus?: string;
  validFromDate?: string;
  validFromTime?: string;
  validToDate?: string;
  contactPerson?: number;
}
interface Location { id: number; locationName?: string; name?: string }
interface VisitorRow { id: number; appointmentId: number; visitorName?: string; mobile?: string; visitorCheckin?: string | null; visitorCheckout?: string | null }
interface JoinedRow extends Appointment {
  visitorId: number;
  visitorName: string;
  mobile: string;
  visitorCheckin: string | null;
  visitorCheckout: string | null;
  locationName: string;
  derivedStatus: string;
}

function deriveStatus(r: { requestStatus?: string; visitorCheckin?: string | null; visitorCheckout?: string | null }): string {
  if (r.requestStatus === 'pending') return 'Pending for Approval';
  if (r.requestStatus === 'rejected') return 'Rejected';
  if (r.requestStatus === 'cancelled') return 'Cancelled';
  if (!r.visitorCheckin) return 'Pending for Card';
  if (!r.visitorCheckout) return 'Pending for Checkout';
  return 'Visited';
}

const STATUS_BADGE: Record<string, string> = {
  'Pending for Approval': 'warning',
  'Pending for Card': 'info',
  'Pending for Checkout': 'primary',
  'Visited': 'success',
  'Rejected': 'danger',
  'Cancelled': 'default',
};

export default function ManageAppointmentPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [visitorsByAppt, setVisitorsByAppt] = useState<Record<number, VisitorRow[]>>({});
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters (mirror the legacy "Organization | From Date | To Date | Reset")
  const [orgFilter, setOrgFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [pageIndex, setPageIndex] = useState(1);

  // Delete confirm modal
  const [pendingDelete, setPendingDelete] = useState<{ apptId: number; visitorId: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<{ id: number }>('/auth/me');
        setUserId(me.id);
        const locs = await apiFetch<Location[]>('/visitors/locations');
        setLocations(Array.isArray(locs) ? locs : []);
        await reload(me.id);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reload(uid: number) {
    setLoading(true);
    try {
      const list = await apiFetch<Appointment[]>(`/visitors/appointments?contactPerson=${uid}`);
      setAppts(Array.isArray(list) ? list : []);
      // Pull visitors for the listed appointments. Could be expensive for very
      // large lists — for now N+1 is fine given the per-user scope.
      const map: Record<number, VisitorRow[]> = {};
      await Promise.all(
        (list ?? []).slice(0, 200).map(async (a) => {
          try {
            const d = await apiFetch<{ appointment: Appointment; visitors: VisitorRow[] }>(`/visitors/appointments/${a.id}`);
            map[a.id] = Array.isArray(d?.visitors) ? d.visitors : [];
          } catch { map[a.id] = []; }
        }),
      );
      setVisitorsByAppt(map);
    } catch {}
    setLoading(false);
  }

  const locById = useMemo(() => {
    const m = new Map<number, string>();
    for (const l of locations) m.set(l.id, l.locationName ?? l.name ?? `#${l.id}`);
    return m;
  }, [locations]);

  // One row per (appointment, visitor) pair to match the legacy table shape.
  const rows: JoinedRow[] = useMemo(() => {
    const out: JoinedRow[] = [];
    for (const a of appts) {
      const visitors = visitorsByAppt[a.id] ?? [];
      const list: VisitorRow[] = visitors.length
        ? visitors
        : [{ id: 0, appointmentId: a.id, visitorName: '—', mobile: '—', visitorCheckin: null, visitorCheckout: null }];
      for (const v of list) {
        out.push({
          ...a,
          visitorId: v.id,
          visitorName: v.visitorName ?? '—',
          mobile: v.mobile ?? '—',
          visitorCheckin: v.visitorCheckin ?? null,
          visitorCheckout: v.visitorCheckout ?? null,
          locationName: locById.get(a.visitorLocationId ?? 0) ?? '—',
          derivedStatus: deriveStatus({
            requestStatus: a.requestStatus,
            visitorCheckin: v.visitorCheckin,
            visitorCheckout: v.visitorCheckout,
          }),
        });
      }
    }
    return out;
  }, [appts, visitorsByAppt, locById]);

  const orgOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.company).filter(Boolean))).sort() as string[],
    [rows],
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (orgFilter && r.company !== orgFilter) return false;
      if (fromDate && (r.validFromDate ?? '') < fromDate) return false;
      if (toDate && (r.validToDate ?? r.validFromDate ?? '') > toDate) return false;
      return true;
    });
  }, [rows, orgFilter, fromDate, toDate]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageStart = (pageIndex - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);

  // Clamp page when filters change.
  useEffect(() => { if (pageIndex > pageCount) setPageIndex(1); }, [pageCount, pageIndex]);

  function reset() {
    setOrgFilter(''); setFromDate(''); setToDate(''); setPageIndex(1);
  }

  async function confirmDelete() {
    if (!pendingDelete || !userId) return;
    try {
      await apiFetch(`/visitors/appointments/${pendingDelete.apptId}/cancel`, { method: 'PUT' });
      setPendingDelete(null);
      await reload(userId);
    } catch {}
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Manage Visitor Appointment</h2>
        </div>
        <div className="col-lg-2" style={{ paddingTop: 20, textAlign: 'right' }}>
          <Link href="/portal/visitors/appointment/add" className="btn btn-primary btn-sm">
            <i className="fa fa-plus" style={{ marginRight: 4 }} />Add Appointment
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <h5 style={{ margin: 0 }}>Visitor List</h5>
          </div>
          <div className="ibox-content">
            {/* Filter row */}
            <div className="row" style={{ marginBottom: 14 }}>
              <div className="col-sm-5">
                <label style={{ fontSize: 12, color: '#676a6c' }}>Organization</label>
                <select
                  className="form-control input-sm"
                  value={orgFilter}
                  onChange={(e) => { setOrgFilter(e.target.value); setPageIndex(1); }}
                >
                  <option value="">All</option>
                  {orgOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="col-sm-2">
                <label style={{ fontSize: 12, color: '#676a6c' }}>From Date</label>
                <input
                  type="date"
                  className="form-control input-sm"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setPageIndex(1); }}
                />
              </div>
              <div className="col-sm-2">
                <label style={{ fontSize: 12, color: '#676a6c' }}>To Date</label>
                <input
                  type="date"
                  className="form-control input-sm"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setPageIndex(1); }}
                />
              </div>
              <div className="col-sm-2" style={{ paddingTop: 18 }}>
                <button className="btn btn-default btn-sm" onClick={reset}>Reset</button>
              </div>
            </div>

            {/* Table */}
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
                      <th>Visitor Organization</th>
                      <th>Visitor Location</th>
                      <th>Appointment Date</th>
                      <th>Appointment Time</th>
                      <th>Meeting Purpose</th>
                      <th>Pass Type</th>
                      <th>Entry Gate</th>
                      <th>Status</th>
                      <th>To Date</th>
                      <th>Appointment Id</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={12} style={{ textAlign: 'center', color: '#aaa', padding: 30 }}>
                          No data available in table
                        </td>
                      </tr>
                    ) : pageRows.map((r, i) => (
                      <tr key={`${r.id}-${r.visitorId}-${i}`}>
                        <td>{r.visitorName}</td>
                        <td>{r.company ?? '—'}</td>
                        <td>{r.locationName}</td>
                        <td>{r.validFromDate ?? '—'}</td>
                        <td>{r.validFromTime ?? '—'}</td>
                        <td>{r.purposeOfVisit ?? '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{r.passType ?? '—'}</td>
                        <td>{r.gateName ?? '—'}</td>
                        <td>
                          <span className={`label label-${STATUS_BADGE[r.derivedStatus] ?? 'default'}`}>
                            {r.derivedStatus}
                          </span>
                        </td>
                        <td>{r.validToDate ?? '—'}</td>
                        <td>{r.id}</td>
                        <td>
                          {!r.visitorCheckin ? (
                            <div className="btns-texts" style={{ display: 'flex', gap: 4 }}>
                              <Link
                                href={`/portal/visitors/appointment/${r.id}`}
                                className="btn btn-white btn-xs"
                              >
                                <i className="fa fa-pencil" /> Edit
                              </Link>
                              <button
                                className="btn btn-white btn-xs"
                                onClick={() => setPendingDelete({ apptId: r.id, visitorId: r.visitorId })}
                              >
                                <span className="fa fa-times" /> Delete
                              </button>
                            </div>
                          ) : <span style={{ color: '#aaa', fontSize: 11 }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination + count */}
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

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }} onClick={() => setPendingDelete(null)}>
          <div style={{ background: '#fff', borderRadius: 6, padding: 24, maxWidth: 360, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 56, color: '#f8ac59', marginBottom: 12 }}>
              <i className="fa fa-exclamation-triangle" />
            </div>
            <h2 style={{ margin: '8px 0' }}>Are you sure?</h2>
            <p style={{ color: '#777' }}>You want to delete this appointment.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <button className="btn btn-default" onClick={() => setPendingDelete(null)}>Close</button>
              <button className="btn btn-warning" onClick={confirmDelete}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
