'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Appointment {
  id: number;
  company?: string;
  purposeOfVisit?: string;
  contactPerson?: number;
  passType?: string;
  validFromDate?: string;
  validToDate?: string;
  requestStatus?: string;
  barcodeNumber?: string;
  mealAllowed?: string;
  visitorLocationId?: number;
  requestCreatedBy?: string;
  employeeApproved?: string;
  createdAt?: string;
}

interface Location { id: number; name?: string; locationName?: string; }

const STATUS_COLOR: Record<string, string> = {
  pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'default',
};

export default function VisitorsAdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    (async () => {
      const [a, l] = await Promise.all([
        apiFetch<Appointment[]>('/visitors/appointments?all=1'),
        apiFetch<Location[]>('/visitors/locations'),
      ]);
      setAppointments(a); setLocations(l);
      setLoading(false);
    })();
  }, []);

  async function handleApprove(id: number, approved: boolean) {
    const remarks = !approved ? (prompt('Rejection reason (optional):') ?? '') : '';
    await apiFetch(`/visitors/appointments/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approverId: 0, approved, remarks }),
    });
    setAppointments(a => a.map(x =>
      x.id === id ? { ...x, requestStatus: approved ? 'approved' : 'rejected' } : x,
    ));
  }

  const filtered = appointments.filter(a => {
    if (statusFilter && a.requestStatus !== statusFilter) return false;
    if (locationFilter && String(a.visitorLocationId) !== locationFilter) return false;
    return true;
  });

  const locationMap = Object.fromEntries(
    locations.map(l => [l.id, l.locationName ?? l.name ?? `#${l.id}`]),
  );

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.requestStatus === 'pending').length,
    approved: appointments.filter(a => a.requestStatus === 'approved').length,
    rejected: appointments.filter(a => a.requestStatus === 'rejected').length,
  };

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Visitor Pass — Admin</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Admin</Link></li>
            <li className="active"><strong>Visitor Pass</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Stats */}
        <div className="row" style={{ marginBottom: 16 }}>
          {[
            { label: 'Total', value: stats.total, color: '#1c84c6' },
            { label: 'Pending', value: stats.pending, color: '#f8ac59' },
            { label: 'Approved', value: stats.approved, color: '#1ab394' },
            { label: 'Rejected', value: stats.rejected, color: '#ed5565' },
          ].map(s => (
            <div key={s.label} className="col-lg-3 col-sm-6">
              <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
                <div className="ibox-content" style={{ background: s.color, color: '#fff', borderRadius: 4, padding: '14px 20px' }}>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <h5 style={{ margin: 0 }}>All Visitor Appointments</h5>
          </div>
          <div className="ibox-content">
            {/* Filters */}
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <select className="form-control input-sm" style={{ width: 160 }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select className="form-control input-sm" style={{ width: 200 }}
                value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
                <option value="">All Locations</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.locationName ?? l.name ?? `Location #${l.id}`}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Company</th><th>Location</th><th>Contact Emp</th>
                      <th>Pass Type</th><th>Valid From</th><th>Valid To</th>
                      <th>Barcode</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.company ?? '—'}</strong></td>
                        <td style={{ fontSize: 12 }}>{locationMap[a.visitorLocationId ?? 0] ?? '—'}</td>
                        <td style={{ fontSize: 12 }}>{a.contactPerson ?? '—'}</td>
                        <td style={{ fontSize: 12, textTransform: 'capitalize' }}>{a.passType ?? '—'}</td>
                        <td style={{ fontSize: 12 }}>{a.validFromDate ?? '—'}</td>
                        <td style={{ fontSize: 12 }}>{a.validToDate ?? '—'}</td>
                        <td style={{ fontSize: 11, fontFamily: 'monospace', color: '#888' }}>{a.barcodeNumber ?? '—'}</td>
                        <td>
                          <span className={`label label-${STATUS_COLOR[a.requestStatus ?? ''] ?? 'default'}`} style={{ textTransform: 'capitalize' }}>
                            {a.requestStatus ?? '—'}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {a.requestStatus === 'pending' && (
                            <>
                              <button className="btn btn-xs btn-success" style={{ marginRight: 4 }}
                                title="Approve" onClick={() => handleApprove(a.id, true)}>
                                <i className="fa fa-check" />
                              </button>
                              <button className="btn btn-xs btn-danger"
                                title="Reject" onClick={() => handleApprove(a.id, false)}>
                                <i className="fa fa-times" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center text-muted" style={{ padding: 24 }}>No appointments match the selected filters.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
