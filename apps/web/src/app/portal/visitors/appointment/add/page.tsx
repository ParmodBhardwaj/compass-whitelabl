'use client';
/**
 * /portal/visitors/appointment/add — New visitor appointment.
 *
 * Pixel-faithful clone of the legacy /visitors/{locationId}/appointment/add.html
 * form (module/Visitors/view/visitors/appointment/frontend/appointment_form.phtml
 * + AppointmentForm.php + VisitorCollectionForm.php). Same layout, same
 * required-field set, same Add Visitor / Remove behaviour, same right-hand
 * "Today's Pending Appointments" sidebar.
 *
 * Validation (mirrors Laminas form rules):
 *   Required: Visitor Location, Visitor Organisation, Name (per visitor),
 *             Mobile (per visitor, maxlength 15), Appointment Date,
 *             Appointment Time, Expected Out Time, Pass Type, Select Gate,
 *             Purpose of Visit
 *   Optional: Email, Laptop Number, Other Material, Visitor Materials (if any),
 *             Remarks (if any), Contact Person (only when "On behalf of …" is checked)
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface Location { id: number; locationName?: string; name?: string }
interface Pass     { id: number; name?: string; locationId?: number; status?: string }
interface Employee { id?: number; userId?: number; name?: string; ecode?: string; functionText?: string }
interface VisitorRow {
  visitorName: string;
  mobile: string;
  visitorEmail: string;
  laptopNumber: string;
  otherMaterial: string;
}
interface TodayPending {
  id: number;
  time?: string;
  company?: string;
  requestStatus?: string;
  visitors: Array<{ visitorName?: string; mobile?: string }>;
}

const BLANK_VISITOR: VisitorRow = {
  visitorName: '', mobile: '', visitorEmail: '',
  laptopNumber: '', otherMaterial: '',
};

const GATES = ['Gate 1', 'Gate 6'] as const;

/** Legacy-style today + +1h default times (24-hour HH:mm). */
function defaultTimes(): { from: string; to: string; date: string } {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const inOne = new Date(now.getTime() + 60 * 60 * 1000);
  const hh2 = String(inOne.getHours()).padStart(2, '0');
  const mm2 = String(inOne.getMinutes()).padStart(2, '0');
  return { date, from: `${hh}:${mm}`, to: `${hh2}:${mm2}` };
}

export default function AddAppointmentPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const prefillName   = sp.get('prefillName')   ?? '';
  const prefillMobile = sp.get('prefillMobile') ?? '';
  const prefillEmail  = sp.get('prefillEmail')  ?? '';

  const [userId, setUserId] = useState<number | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todayPending, setTodayPending] = useState<TodayPending[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Appointment header (single row) ─────────────────────────────────────
  const defs = useMemo(defaultTimes, []);
  const [form, setForm] = useState({
    visitorLocationId: 0,
    company: '',
    otherEmployee: false,
    contactPerson: 0,            // only used when otherEmployee === true
    validFromDate: defs.date,
    validFromTime: defs.from,
    validToDate:   defs.date,
    validToTime:   defs.to,
    passType: 0,
    gateName: '',
    purposeOfVisit: '',
    visitorMaterials: '',
    remarks: '',
  });

  // ── Per-visitor rows (Add Visitor / Remove) ─────────────────────────────
  const [visitors, setVisitors] = useState<VisitorRow[]>(() => {
    if (prefillName || prefillMobile) {
      return [{ ...BLANK_VISITOR, visitorName: prefillName, mobile: prefillMobile, visitorEmail: prefillEmail }];
    }
    return [{ ...BLANK_VISITOR }];
  });

  // ── Bootstrap: me + locations + employees ───────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [me, locs] = await Promise.all([
          apiFetch<{ id: number }>('/auth/me'),
          apiFetch<Location[]>('/visitors/locations'),
        ]);
        setUserId(me.id);
        const locList = Array.isArray(locs) ? locs : [];
        setLocations(locList);
        // Default to first location so the user sees Pass Type populated.
        if (locList.length && !form.visitorLocationId) {
          setForm((s) => ({ ...s, visitorLocationId: locList[0].id }));
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── When location changes, reload passes + today's pending list ─────────
  useEffect(() => {
    if (!form.visitorLocationId) {
      setPasses([]);
      setTodayPending([]);
      return;
    }
    (async () => {
      try {
        const ps = await apiFetch<Pass[]>(`/visitors/passes?locationId=${form.visitorLocationId}`);
        setPasses(Array.isArray(ps) ? ps : []);
      } catch { setPasses([]); }
      try {
        const tp = await apiFetch<TodayPending[]>(
          `/visitors/appointments/today/pending?locationId=${form.visitorLocationId}${userId ? `&mine=1` : ''}`,
        );
        setTodayPending(Array.isArray(tp) ? tp : []);
      } catch { setTodayPending([]); }
    })();
  }, [form.visitorLocationId, userId]);

  // ── Lazy-load employees only when "On behalf of Other Employee" toggled ─
  useEffect(() => {
    if (!form.otherEmployee || employees.length > 0) return;
    apiFetch<any>('/employees?limit=500')
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : Array.isArray(rows?.rows) ? rows.rows : [];
        setEmployees(list);
      })
      .catch(() => setEmployees([]));
  }, [form.otherEmployee, employees.length]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  function setVisitorAt(i: number, patch: Partial<VisitorRow>) {
    setVisitors((arr) => arr.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }
  function addVisitor() {
    setVisitors((arr) => [...arr, { ...BLANK_VISITOR }]);
  }
  function removeVisitor() {
    // Legacy "Remove" pops the last visitor row (must keep ≥1).
    setVisitors((arr) => (arr.length > 1 ? arr.slice(0, -1) : arr));
  }
  function reset() {
    setForm({
      visitorLocationId: locations[0]?.id ?? 0,
      company: '',
      otherEmployee: false,
      contactPerson: 0,
      validFromDate: defs.date,
      validFromTime: defs.from,
      validToDate:   defs.date,
      validToTime:   defs.to,
      passType: 0,
      gateName: '',
      purposeOfVisit: '',
      visitorMaterials: '',
      remarks: '',
    });
    setVisitors([{ ...BLANK_VISITOR }]);
    setError('');
  }

  // ── Validate exactly like the legacy AppointmentForm ────────────────────
  function validate(): string | null {
    if (!form.visitorLocationId) return 'Visitor Location is required.';
    if (!form.company.trim())   return 'Visitor Organisation is required.';
    if (form.otherEmployee && !form.contactPerson) {
      return 'Please pick the employee you are booking on behalf of.';
    }
    const validVisitors = visitors.filter((v) => v.visitorName.trim() && v.mobile.trim());
    if (validVisitors.length === 0) {
      return 'At least one visitor with Name and Mobile is required.';
    }
    for (let i = 0; i < visitors.length; i++) {
      const v = visitors[i];
      if (!v.visitorName.trim() && !v.mobile.trim()) continue; // skip blank rows
      if (!v.visitorName.trim()) return `Visitor #${i + 1}: Name is required.`;
      if (!v.mobile.trim())      return `Visitor #${i + 1}: Mobile is required.`;
      if (v.mobile.length > 15)  return `Visitor #${i + 1}: Mobile must be at most 15 chars.`;
    }
    if (!form.validFromDate) return 'Appointment Date is required.';
    if (!form.validFromTime) return 'Appointment Time is required.';
    if (!form.validToTime)   return 'Expected Out Time is required.';
    if (!form.passType)      return 'Pass Type is required.';
    if (!form.gateName)      return 'Please select a gate.';
    if (!form.purposeOfVisit.trim()) return 'Purpose of Visit is required.';
    // Out-time must be after in-time when same date.
    if (form.validFromDate === form.validToDate && form.validFromTime >= form.validToTime) {
      return 'Expected Out Time must be after Appointment Time.';
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) { setError(v); return; }
    if (!userId) return;

    setSaving(true);
    try {
      const validVisitors = visitors.filter((vr) => vr.visitorName.trim() && vr.mobile.trim());
      const selectedPass = passes.find((p) => p.id === form.passType);
      await apiFetch('/visitors/appointments', {
        method: 'POST',
        body: JSON.stringify({
          visitorLocationId: form.visitorLocationId,
          company: form.company.trim(),
          contactPerson: form.otherEmployee && form.contactPerson ? form.contactPerson : userId,
          requestCreatedBy: String(userId),
          passType: selectedPass?.name ?? '',
          validFromDate: form.validFromDate,
          validFromTime: form.validFromTime,
          validToDate: form.validToDate || form.validFromDate,
          validToTime: form.validToTime,
          purposeOfVisit: form.purposeOfVisit.trim(),
          visitorMaterials: form.visitorMaterials.trim() || null,
          remarks: form.remarks.trim() || null,
          gateName: form.gateName,
          visitors: validVisitors,
        }),
      });
      router.push('/portal/visitors');
    } catch {
      setError('Failed to create appointment. Please try again.');
    } finally { setSaving(false); }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>New Appointment</h2>
        </div>
        <div className="col-lg-2" style={{ paddingTop: 20, textAlign: 'right' }}>
          <Link href="/portal/visitors" className="btn btn-danger btn-sm">
            <i className="fa fa-angle-left" style={{ marginRight: 4 }} />Back
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* ─────────────────── MAIN FORM ─────────────────── */}
            <div className="col-lg-8">
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>Request List</h5>
                </div>
                <div className="ibox-content">
                  {error && (
                    <div className="alert alert-danger" style={{ marginBottom: 14 }}>
                      <i className="fa fa-exclamation-circle" style={{ marginRight: 6 }} />
                      {error}
                    </div>
                  )}

                  {/* Visitor Location + Organisation */}
                  <div className="row">
                    <div className="col-sm-6 form-group">
                      <label className="font-noraml required">Visitor Location <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        value={form.visitorLocationId}
                        onChange={(e) => setForm((s) => ({ ...s, visitorLocationId: +e.target.value }))}
                        required
                      >
                        <option value={0}>Select Location</option>
                        {locations.map((l) => (
                          <option key={l.id} value={l.id}>{l.locationName ?? l.name ?? `Location #${l.id}`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-6 form-group">
                      <label className="font-noraml required">Visitor Organisation <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        autoComplete="off"
                        placeholder="Visitor Organisation"
                        value={form.company}
                        onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* On behalf of Other Employee + Add/Remove Visitor */}
                  <div className="row" style={{ marginBottom: 6 }}>
                    <div className="col-sm-6">
                      <div className="checkbox" style={{ marginTop: 0 }}>
                        <label>
                          <input
                            type="checkbox"
                            checked={form.otherEmployee}
                            onChange={(e) => setForm((s) => ({ ...s, otherEmployee: e.target.checked }))}
                          />
                          {' '}On behalf of Other Employee
                        </label>
                      </div>
                      {form.otherEmployee && (
                        <select
                          className="form-control"
                          style={{ marginTop: 6 }}
                          value={form.contactPerson}
                          onChange={(e) => setForm((s) => ({ ...s, contactPerson: +e.target.value }))}
                        >
                          <option value={0}>-- Please Select --</option>
                          {employees.map((emp) => {
                            const id = emp.id ?? emp.userId ?? 0;
                            const ec = emp.ecode ? `EC-${String(emp.ecode).replace(/^0+/, '')}` : '';
                            const fn = emp.functionText ? ` - ${emp.functionText}` : '';
                            return (
                              <option key={id} value={id}>
                                {emp.name}{ec ? ` ( ${ec}${fn} )` : ''}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                    <div className="col-sm-6 text-right">
                      <button type="button" className="btn btn-white btn-sm" onClick={addVisitor} style={{ marginRight: 4 }}>
                        Add Visitor <i className="fa fa-user-plus" style={{ marginLeft: 4 }} />
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={removeVisitor} disabled={visitors.length <= 1}>
                        Remove <i className="fa fa-user-times" style={{ marginLeft: 4 }} />
                      </button>
                    </div>
                  </div>

                  {/* Visitor Information block (bordered) */}
                  <div style={{
                    border: '1px solid #e7eaec', borderRadius: 4, padding: 14,
                    marginTop: 8, marginBottom: 18, position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: -12, left: '50%',
                      transform: 'translateX(-50%)', background: '#fff', padding: '0 12px',
                      fontWeight: 700, color: '#676a6c', fontSize: 14,
                    }}>
                      Visitor Information
                    </div>

                    {visitors.map((v, i) => (
                      <div key={i} style={{ borderTop: i > 0 ? '1px dashed #eee' : 'none', paddingTop: i > 0 ? 12 : 0, marginTop: i > 0 ? 12 : 0 }}>
                        {visitors.length > 1 && (
                          <div style={{ fontSize: 11, color: '#999', marginBottom: 6, textTransform: 'uppercase' }}>
                            Visitor #{i + 1}
                          </div>
                        )}
                        <div className="row">
                          <div className="col-sm-4 form-group">
                            <label>Name <span className="text-danger">*</span></label>
                            <input
                              className="form-control"
                              value={v.visitorName}
                              onChange={(e) => setVisitorAt(i, { visitorName: e.target.value })}
                            />
                          </div>
                          <div className="col-sm-4 form-group">
                            <label>Email</label>
                            <input
                              className="form-control"
                              type="email"
                              value={v.visitorEmail}
                              onChange={(e) => setVisitorAt(i, { visitorEmail: e.target.value })}
                            />
                          </div>
                          <div className="col-sm-4 form-group">
                            <label>Mobile <span className="text-danger">*</span></label>
                            <input
                              className="form-control"
                              type="tel"
                              maxLength={15}
                              value={v.mobile}
                              onChange={(e) => setVisitorAt(i, { mobile: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-4 form-group">
                            <label>Laptop Number</label>
                            <input
                              className="form-control"
                              value={v.laptopNumber}
                              onChange={(e) => setVisitorAt(i, { laptopNumber: e.target.value })}
                            />
                          </div>
                          <div className="col-sm-4 form-group">
                            <label>Other Material</label>
                            <input
                              className="form-control"
                              value={v.otherMaterial}
                              onChange={(e) => setVisitorAt(i, { otherMaterial: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Appointment Date / Time / Expected Out Time */}
                  <div className="row">
                    <div className="col-sm-4 form-group">
                      <label className="font-noraml required">Appointment Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.validFromDate}
                        onChange={(e) => setForm((s) => ({ ...s, validFromDate: e.target.value, validToDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-sm-4 form-group">
                      <label className="font-noraml required">Appointment Time <span className="text-danger">*</span></label>
                      <input
                        type="time"
                        className="form-control"
                        value={form.validFromTime}
                        onChange={(e) => setForm((s) => ({ ...s, validFromTime: e.target.value }))}
                        placeholder="24:00 (H:M)"
                        required
                      />
                    </div>
                    <div className="col-sm-4 form-group">
                      <label className="font-noraml required">Expected Out Time <span className="text-danger">*</span></label>
                      <input
                        type="time"
                        className="form-control"
                        value={form.validToTime}
                        onChange={(e) => setForm((s) => ({ ...s, validToTime: e.target.value }))}
                        placeholder="24:00 (H:M)"
                        required
                      />
                    </div>
                  </div>

                  <p style={{ color: '#1c84c6', fontSize: 12, marginTop: -6, marginBottom: 14 }}>
                    For future date visitor pass click on selected date for de-selection then select on desired date from calendar.
                  </p>

                  {/* Pass Type / Gate */}
                  <div className="row">
                    <div className="col-sm-6 form-group">
                      <label className="font-noraml required">Pass Type <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        value={form.passType}
                        onChange={(e) => setForm((s) => ({ ...s, passType: +e.target.value }))}
                        required
                      >
                        <option value={0}>-- Please Select --</option>
                        {passes.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-6 form-group">
                      <label className="font-noraml required">Select Gate <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        value={form.gateName}
                        onChange={(e) => setForm((s) => ({ ...s, gateName: e.target.value }))}
                        required
                      >
                        <option value="">Select Gate</option>
                        {GATES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Purpose / Visitor Materials */}
                  <div className="row">
                    <div className="col-sm-6 form-group">
                      <label className="font-noraml required">Purpose of Visit <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        value={form.purposeOfVisit}
                        onChange={(e) => setForm((s) => ({ ...s, purposeOfVisit: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-sm-6 form-group">
                      <label>Visitor Materials (if any)</label>
                      <input
                        className="form-control"
                        value={form.visitorMaterials}
                        onChange={(e) => setForm((s) => ({ ...s, visitorMaterials: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Remarks (full width) */}
                  <div className="form-group">
                    <label>Remarks (if any)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.remarks}
                      onChange={(e) => setForm((s) => ({ ...s, remarks: e.target.value }))}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                    <button type="button" className="btn" style={{ background: '#2c3e50', color: '#fff' }} onClick={reset}>
                      Reset
                    </button>
                    <button type="submit" className="btn btn-danger" disabled={saving}>
                      {saving
                        ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Submitting…</>
                        : 'Place Appointment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─────────────────── SIDEBAR ─────────────────── */}
            <div className="col-lg-4">
              <div className="ibox float-e-margins">
                <div className="ibox-title" style={{ textAlign: 'center' }}>
                  <h5 style={{ margin: 0 }}>Today&apos;s Pending Appointments</h5>
                </div>
                <div className="ibox-content" style={{ padding: 0 }}>
                  <table className="table table-striped" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ fontSize: 12, padding: '8px 10px' }}>Visitor&apos;s Name</th>
                        <th style={{ fontSize: 12, padding: '8px 10px' }}>Appointment Time</th>
                        <th style={{ fontSize: 12, padding: '8px 10px' }}>Mobile No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayPending.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: '#aaa', padding: 16, fontSize: 12 }}>
                            No Appointment Found for today.
                          </td>
                        </tr>
                      ) : (
                        todayPending.flatMap((a) => {
                          const rows = a.visitors.length ? a.visitors : [{ visitorName: '—', mobile: '—' }];
                          return rows.map((v, i) => (
                            <tr key={`${a.id}-${i}`}>
                              <td style={{ fontSize: 12, padding: '6px 10px' }}>
                                {v.visitorName ?? '—'}
                                {i === 0 && a.company ? <div style={{ fontSize: 10, color: '#999' }}>{a.company}</div> : null}
                              </td>
                              <td style={{ fontSize: 12, padding: '6px 10px' }}>{i === 0 ? (a.time ?? '—') : ''}</td>
                              <td style={{ fontSize: 12, padding: '6px 10px' }}>{v.mobile ?? '—'}</td>
                            </tr>
                          ));
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
