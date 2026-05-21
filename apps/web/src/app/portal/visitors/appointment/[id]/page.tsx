'use client';
/**
 * /portal/visitors/appointment/[id] — Appointment detail + status.
 *
 * Mirrors legacy /visitors/visitor-appointment-status.html: header info,
 * visitor list with check-in/check-out times, approval status badge,
 * and quick actions (cancel, print gate pass).
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface Appointment {
  id: number;
  visitorLocationId: number;
  company: string;
  purposeOfVisit?: string;
  contactPerson: number;
  passType?: string;
  requestStatus?: string;
  validFromDate?: string;
  validFromTime?: string;
  validToDate?: string;
  validToTime?: string;
  remarks?: string;
  barcodeNumber?: string;
  mealAllowed?: string;
  createdAt?: string;
}

interface VisitorRow {
  id: number;
  visitorName?: string;
  mobile?: string;
  visitorEmail?: string;
  visitorCheckin?: string;
  visitorCheckout?: string;
  laptopNumber?: string;
  otherMaterial?: string;
  tokenNumber?: string;
}

interface ApprovalMember {
  id: number;
  empId: number;
  passTypeApproval?: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'warning', approved: 'success', rejected: 'danger',
  cancelled: 'default', completed: 'info',
};

const PASS_TYPE_COLORS: Record<string, string> = {
  green: 'success', yellow: 'warning', red: 'danger', blue: 'primary',
};

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [data, setData] = useState<{ appointment: Appointment; visitors: VisitorRow[] } | null>(null);
  const [approvalMembers, setApprovalMembers] = useState<ApprovalMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await apiFetch<{ appointment: Appointment; visitors: VisitorRow[] }>(`/visitors/appointments/${id}`);
      setData(detail);
      if (detail?.appointment?.visitorLocationId) {
        const am = await apiFetch<ApprovalMember[]>(
          `/visitors/approval-members?locationId=${detail.appointment.visitorLocationId}&passType=${detail.appointment.passType ?? ''}`,
        ).catch(() => []);
        setApprovalMembers(Array.isArray(am) ? am : []);
      }
    } catch {}
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function cancelAppointment() {
    if (!confirm('Cancel this appointment? Visitors will be notified.')) return;
    await apiFetch(`/visitors/appointments/${id}/cancel`, { method: 'PUT' });
    setMsg('Appointment cancelled.');
    load();
  }

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="ibox-content text-center" style={{ padding: 40 }}>
          <i className="fa fa-spinner fa-spin fa-2x text-muted" />
        </div>
      </div>
    );
  }

  if (!data?.appointment) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="ibox-content text-center" style={{ padding: 40, color: '#aaa' }}>
          Appointment not found. <Link href="/portal/visitors" style={{ color: '#e2231a' }}>← Back to list</Link>
        </div>
      </div>
    );
  }

  const a = data.appointment;
  const canCancel = a.requestStatus === 'pending' || a.requestStatus === 'approved';

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-9">
          <h2>Appointment #{a.id} — {a.company}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/visitors">Visitor Gate Pass</Link></li>
            <li className="active"><strong>Appointment #{a.id}</strong></li>
          </ol>
        </div>
        <div className="col-lg-3" style={{ paddingTop: 20, textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          {a.requestStatus === 'approved' && (
            <Link href={`/portal/visitors/gate-pass/${a.id}`} className="btn btn-success btn-sm" target="_blank">
              <i className="fa fa-print" style={{ marginRight: 4 }} />Gate Pass
            </Link>
          )}
          {canCancel && (
            <button className="btn btn-danger btn-sm" onClick={cancelAppointment}>
              <i className="fa fa-times" style={{ marginRight: 4 }} />Cancel
            </button>
          )}
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {msg && <div className="alert alert-success">{msg}</div>}

        {/* Status banner */}
        <div className="ibox float-e-margins">
          <div className="ibox-content" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Status</div>
              <span className={`label label-${STATUS_COLOR[a.requestStatus ?? ''] ?? 'default'}`}
                style={{ textTransform: 'uppercase', fontSize: 13, padding: '5px 12px' }}>
                {a.requestStatus ?? '—'}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Pass Type</div>
              {a.passType ? (
                <span className={`label label-${PASS_TYPE_COLORS[a.passType] ?? 'default'}`}
                  style={{ textTransform: 'capitalize', fontSize: 13, padding: '5px 12px' }}>
                  {a.passType}
                </span>
              ) : '—'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Barcode</div>
              <code style={{ background: '#f5f5f5', padding: '3px 8px', borderRadius: 3, fontSize: 12 }}>
                {a.barcodeNumber ?? '—'}
              </code>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Meal Allowed</div>
              <strong style={{ textTransform: 'capitalize' }}>{a.mealAllowed ?? '—'}</strong>
            </div>
          </div>
        </div>

        {/* Appointment header */}
        <div className="ibox float-e-margins">
          <div className="ibox-title"><h5 style={{ margin: 0 }}>Appointment Details</h5></div>
          <div className="ibox-content">
            <dl className="dl-horizontal" style={{ marginBottom: 0 }}>
              <dt>Company</dt>            <dd>{a.company}</dd>
              <dt>Purpose</dt>            <dd>{a.purposeOfVisit ?? '—'}</dd>
              <dt>Visit From</dt>         <dd>{a.validFromDate} {a.validFromTime}</dd>
              <dt>Visit To</dt>           <dd>{a.validToDate} {a.validToTime}</dd>
              <dt>Remarks</dt>            <dd>{a.remarks ?? '—'}</dd>
              <dt>Created</dt>            <dd>{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</dd>
            </dl>
          </div>
        </div>

        {/* Visitors */}
        <div className="ibox float-e-margins">
          <div className="ibox-title"><h5 style={{ margin: 0 }}>Visitors ({data.visitors.length})</h5></div>
          <div className="ibox-content" style={{ padding: 0 }}>
            <table className="table table-hover" style={{ marginBottom: 0 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '10px 16px', fontSize: 12 }}>#</th>
                  <th style={{ padding: '10px 16px', fontSize: 12 }}>Name</th>
                  <th style={{ padding: '10px 16px', fontSize: 12 }}>Mobile</th>
                  <th style={{ padding: '10px 16px', fontSize: 12 }}>Email</th>
                  <th style={{ padding: '10px 16px', fontSize: 12 }}>Materials</th>
                  <th style={{ padding: '10px 16px', fontSize: 12 }}>Check-in</th>
                  <th style={{ padding: '10px 16px', fontSize: 12 }}>Check-out</th>
                </tr>
              </thead>
              <tbody>
                {data.visitors.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>No visitors recorded.</td></tr>
                ) : data.visitors.map((v, i) => (
                  <tr key={v.id}>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{i + 1}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>{v.visitorName}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{v.mobile}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#1c84c6' }}>{v.visitorEmail}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#777' }}>
                      {[v.laptopNumber && `Laptop: ${v.laptopNumber}`, v.otherMaterial].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: v.visitorCheckin ? '#1ab394' : '#aaa' }}>
                      {v.visitorCheckin ? new Date(v.visitorCheckin).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: v.visitorCheckout ? '#1ab394' : '#aaa' }}>
                      {v.visitorCheckout ? new Date(v.visitorCheckout).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approval members */}
        {approvalMembers.length > 0 && (
          <div className="ibox float-e-margins">
            <div className="ibox-title"><h5 style={{ margin: 0 }}>Approval Workflow ({approvalMembers.length})</h5></div>
            <div className="ibox-content">
              <p style={{ fontSize: 13, color: '#777' }}>
                The following members can approve this appointment based on the location + pass type.
              </p>
              <ul style={{ paddingLeft: 18 }}>
                {approvalMembers.map(m => (
                  <li key={m.id} style={{ fontSize: 13, marginBottom: 4 }}>
                    Employee ID <strong>{m.empId}</strong>
                    {m.passTypeApproval && m.passTypeApproval !== 'all' && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: '#888' }}>
                        — only {m.passTypeApproval} passes
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
