'use client';
/**
 * /portal/visitors/appointment/add — Multi-visitor appointment creation.
 *
 * Matches the legacy flow at /visitors/<plant>/appointment/add.html:
 *   1. Pick plant / location
 *   2. Select pass type (Red / Green / Blue)
 *   3. Fill appointment header (company, purpose, dates, times)
 *   4. Add one or more visitor profiles (name + mobile + email + materials)
 *      — supports both manual entry and a "Pick from Frequent Visitors" picker.
 *   5. Submit → POST /v2/visitors/appointments
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface Location { id: number; locationName?: string; name?: string }

interface VisitorRow {
  visitorName: string;
  mobile: string;
  visitorEmail: string;
  laptopNumber?: string;
  otherMaterial?: string;
}

interface FrequentVisitor {
  visitorName: string;
  mobile: string;
  email?: string;
  visitCount: number;
  lastAppointmentId: number;
}

const PASS_TYPES = [
  { value: 'green',  label: 'Green — Standard visitor',   color: '#1ab394' },
  { value: 'yellow', label: 'Yellow — Vendor / Service',  color: '#f8ac59' },
  { value: 'red',    label: 'Red — Restricted (extra approval needed)', color: '#ed5565' },
  { value: 'blue',   label: 'Blue — VIP',                 color: '#1c84c6' },
];

const BLANK_VISITOR: VisitorRow = {
  visitorName: '', mobile: '', visitorEmail: '',
  laptopNumber: '', otherMaterial: '',
};

export default function AddAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillName   = searchParams.get('prefillName')   ?? '';
  const prefillMobile = searchParams.get('prefillMobile') ?? '';
  const prefillEmail  = searchParams.get('prefillEmail')  ?? '';
  const [userId, setUserId] = useState<number | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [frequent, setFrequent] = useState<FrequentVisitor[]>([]);
  const [showFrequentPicker, setShowFrequentPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [appointment, setAppointment] = useState({
    visitorLocationId: 0,
    company: '',
    purposeOfVisit: '',
    passType: 'green',
    mealAllowed: 'no' as 'yes' | 'no',
    validFromDate: new Date().toISOString().slice(0, 10),
    validFromTime: '09:00',
    validToDate: new Date().toISOString().slice(0, 10),
    validToTime: '18:00',
    visitorMaterials: '',
    remarks: '',
  });

  const [visitors, setVisitors] = useState<VisitorRow[]>(() => {
    // Pre-seed first visitor row if "Invite Again" was clicked on the
    // Frequent Visitors page (passes name/mobile/email via query params).
    if (prefillName || prefillMobile) {
      return [{
        ...BLANK_VISITOR,
        visitorName: prefillName,
        mobile: prefillMobile,
        visitorEmail: prefillEmail,
      }];
    }
    return [{ ...BLANK_VISITOR }];
  });

  useEffect(() => {
    (async () => {
      try {
        const [me, locs, freq] = await Promise.all([
          apiFetch<{ id: number }>('/auth/me'),
          apiFetch<Location[]>('/visitors/locations'),
          apiFetch<FrequentVisitor[]>('/visitors/frequent').catch(() => []),
        ]);
        setUserId(me.id);
        setLocations(Array.isArray(locs) ? locs : []);
        setFrequent(Array.isArray(freq) ? freq : []);
      } catch {}
    })();
  }, []);

  function setVisitorAt(i: number, patch: Partial<VisitorRow>) {
    setVisitors(arr => arr.map((v, idx) => idx === i ? { ...v, ...patch } : v));
  }
  function addVisitor() { setVisitors(arr => [...arr, { ...BLANK_VISITOR }]); }
  function removeVisitor(i: number) {
    setVisitors(arr => arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr);
  }
  function pickFrequent(f: FrequentVisitor) {
    // Add as a new row, or fill the first empty row.
    setVisitors(arr => {
      const emptyIdx = arr.findIndex(v => !v.visitorName.trim() && !v.mobile.trim());
      const next: VisitorRow = {
        visitorName: f.visitorName,
        mobile: f.mobile,
        visitorEmail: f.email ?? '',
        laptopNumber: '',
        otherMaterial: '',
      };
      if (emptyIdx >= 0) {
        return arr.map((v, i) => i === emptyIdx ? next : v);
      }
      return [...arr, next];
    });
    setShowFrequentPicker(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // Validation matching legacy AppointmentForm.php required-field set.
    if (!appointment.visitorLocationId) return setError('Plant location is required.');
    if (!appointment.company.trim()) return setError('Visitor company is required.');
    if (!appointment.validFromDate || !appointment.validToDate) return setError('Visit dates are required.');
    const validVisitors = visitors.filter(v => v.visitorName.trim() && v.mobile.trim());
    if (validVisitors.length === 0) {
      return setError('Please add at least one visitor with name and mobile.');
    }
    if (!userId) return;

    setSaving(true);
    try {
      await apiFetch('/visitors/appointments', {
        method: 'POST',
        body: JSON.stringify({
          ...appointment,
          contactPerson: userId,
          requestCreatedBy: String(userId),
          visitors: validVisitors,
        }),
      });
      router.push('/portal/visitors');
    } catch {
      setError('Failed to create appointment. Please try again.');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-12">
          <h2>New Visitor Appointment</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/visitors">Visitor Gate Pass</Link></li>
            <li className="active"><strong>New Appointment</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* ── Appointment header ───────────────────────────────────────── */}
          <div className="ibox float-e-margins">
            <div className="ibox-title"><h5 style={{ margin: 0 }}>Appointment Details</h5></div>
            <div className="ibox-content">
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-group">
                    <label>Plant Location <span className="text-danger">*</span></label>
                    <select className="form-control" value={appointment.visitorLocationId}
                      onChange={e => setAppointment(a => ({ ...a, visitorLocationId: +e.target.value }))} required>
                      <option value={0}>— Select Plant —</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.locationName ?? l.name ?? `Plant #${l.id}`}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-sm-5">
                  <div className="form-group">
                    <label>Visitor Company <span className="text-danger">*</span></label>
                    <input className="form-control" value={appointment.company}
                      onChange={e => setAppointment(a => ({ ...a, company: e.target.value }))} required />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Pass Type</label>
                    <select className="form-control" value={appointment.passType}
                      onChange={e => setAppointment(a => ({ ...a, passType: e.target.value }))}>
                      {PASS_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Visit From <span className="text-danger">*</span></label>
                    <input type="date" className="form-control" value={appointment.validFromDate}
                      onChange={e => setAppointment(a => ({ ...a, validFromDate: e.target.value }))} required />
                  </div>
                </div>
                <div className="col-sm-2">
                  <div className="form-group">
                    <label>From Time</label>
                    <input type="time" className="form-control" value={appointment.validFromTime}
                      onChange={e => setAppointment(a => ({ ...a, validFromTime: e.target.value }))} />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Visit To <span className="text-danger">*</span></label>
                    <input type="date" className="form-control" value={appointment.validToDate}
                      onChange={e => setAppointment(a => ({ ...a, validToDate: e.target.value }))} required />
                  </div>
                </div>
                <div className="col-sm-2">
                  <div className="form-group">
                    <label>To Time</label>
                    <input type="time" className="form-control" value={appointment.validToTime}
                      onChange={e => setAppointment(a => ({ ...a, validToTime: e.target.value }))} />
                  </div>
                </div>
                <div className="col-sm-2">
                  <div className="form-group">
                    <label>Meal Allowed</label>
                    <select className="form-control" value={appointment.mealAllowed}
                      onChange={e => setAppointment(a => ({ ...a, mealAllowed: e.target.value as 'yes'|'no' }))}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Purpose of Visit</label>
                    <input className="form-control" value={appointment.purposeOfVisit}
                      onChange={e => setAppointment(a => ({ ...a, purposeOfVisit: e.target.value }))} />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Remarks</label>
                    <input className="form-control" value={appointment.remarks}
                      onChange={e => setAppointment(a => ({ ...a, remarks: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Visitor list ─────────────────────────────────────────────── */}
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h5 style={{ margin: 0 }}>Visitors ({visitors.length})</h5>
              <div style={{ display: 'flex', gap: 6 }}>
                {frequent.length > 0 && (
                  <button type="button" className="btn btn-info btn-sm" onClick={() => setShowFrequentPicker(o => !o)}>
                    <i className="fa fa-star" style={{ marginRight: 4 }} />
                    From Frequent ({frequent.length})
                  </button>
                )}
                <button type="button" className="btn btn-primary btn-sm" onClick={addVisitor}>
                  <i className="fa fa-plus" style={{ marginRight: 4 }} />Add Visitor
                </button>
              </div>
            </div>
            <div className="ibox-content">
              {showFrequentPicker && frequent.length > 0 && (
                <div style={{ background: '#f4f9ff', border: '1px solid #c8def0', borderRadius: 4, padding: 12, marginBottom: 14 }}>
                  <strong style={{ fontSize: 12, color: '#1c84c6', textTransform: 'uppercase' }}>Pick from your frequent visitors</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, marginTop: 8 }}>
                    {frequent.map((f, i) => (
                      <button
                        key={`${f.mobile}-${i}`}
                        type="button"
                        onClick={() => pickFrequent(f)}
                        style={{
                          background: '#fff', border: '1px solid #d1e3f3', borderRadius: 4,
                          padding: '8px 12px', textAlign: 'left', cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{f.visitorName}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{f.mobile} · {f.visitCount} visit{f.visitCount > 1 ? 's' : ''}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {visitors.map((v, i) => (
                <div key={i} style={{
                  border: '1px solid #e5e6e7', borderRadius: 4,
                  padding: 14, marginBottom: 10, position: 'relative',
                }}>
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    {visitors.length > 1 && (
                      <button type="button" className="btn btn-danger btn-xs" onClick={() => removeVisitor(i)}>
                        <i className="fa fa-times" />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Visitor #{i + 1}</div>
                  <div className="row">
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Visitor Name <span className="text-danger">*</span></label>
                        <input className="form-control" value={v.visitorName}
                          onChange={e => setVisitorAt(i, { visitorName: e.target.value })} />
                      </div>
                    </div>
                    <div className="col-sm-2">
                      <div className="form-group">
                        <label>Mobile <span className="text-danger">*</span></label>
                        <input className="form-control" type="tel" value={v.mobile}
                          onChange={e => setVisitorAt(i, { mobile: e.target.value })} />
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Email</label>
                        <input className="form-control" type="email" value={v.visitorEmail}
                          onChange={e => setVisitorAt(i, { visitorEmail: e.target.value })} />
                      </div>
                    </div>
                    <div className="col-sm-2">
                      <div className="form-group">
                        <label>Laptop S/N</label>
                        <input className="form-control" value={v.laptopNumber ?? ''}
                          onChange={e => setVisitorAt(i, { laptopNumber: e.target.value })} />
                      </div>
                    </div>
                    <div className="col-sm-2">
                      <div className="form-group">
                        <label>Other Material</label>
                        <input className="form-control" value={v.otherMaterial ?? ''}
                          onChange={e => setVisitorAt(i, { otherMaterial: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Link href="/portal/visitors" className="btn btn-white">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 4 }} />Submitting…</> : <><i className="fa fa-check" style={{ marginRight: 4 }} />Submit Appointment</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
