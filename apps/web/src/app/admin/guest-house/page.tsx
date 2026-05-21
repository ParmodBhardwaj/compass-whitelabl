'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface House { id: number; name: string; locationId?: number; totalRooms?: number; status?: string; image?: string; }
interface Booking {
  id: number; empId?: number; guestHouseId?: string;
  departureDate?: string; arrivalDate?: string;
  purpose?: string; mobile?: string; occupancy?: string;
  status?: string; statusReason?: string; creationDate?: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'default',
};

export default function GuestHouseAdminPage() {
  const [tab, setTab] = useState<'houses' | 'bookings'>('bookings');
  const [houses, setHouses] = useState<House[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [h, b] = await Promise.all([
      apiFetch<House[]>('/guest-house/houses'),
      apiFetch<Booking[]>('/guest-house/bookings?all=1'),
    ]);
    setHouses(h); setBookings(b);
    setLoading(false);
  }

  async function setStatus(id: number, status: string) {
    const reason = status === 'rejected' ? (prompt('Rejection reason (optional):') ?? '') : '';
    await apiFetch(`/guest-house/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, statusReason: reason }),
    });
    setBookings(b => b.map(x => x.id === id ? { ...x, status, statusReason: reason } : x));
  }

  const filteredBookings = statusFilter
    ? bookings.filter(b => b.status === statusFilter)
    : bookings;

  const houseMap = Object.fromEntries(houses.map(h => [h.id, h.name]));

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Guest House — Admin</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Admin</Link></li>
            <li className="active"><strong>Guest House</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Stats */}
        <div className="row" style={{ marginBottom: 16 }}>
          {(['pending', 'approved', 'rejected', 'cancelled'] as const).map(s => {
            const count = bookings.filter(b => b.status === s).length;
            const colors: Record<string, string> = { pending: '#f8ac59', approved: '#1ab394', rejected: '#ed5565', cancelled: '#888' };
            return (
              <div key={s} className="col-lg-3 col-sm-6">
                <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
                  <div className="ibox-content" style={{ background: colors[s], color: '#fff', borderRadius: 4, padding: '14px 20px' }}>
                    <div style={{ fontSize: 26, fontWeight: 700 }}>{count}</div>
                    <div style={{ fontSize: 12, opacity: 0.85, textTransform: 'capitalize' }}>{s}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              <li className={tab === 'bookings' ? 'active' : ''}>
                <a href="#" onClick={e => { e.preventDefault(); setTab('bookings'); }}>
                  All Bookings <span className="badge" style={{ background: '#aaa' }}>{bookings.length}</span>
                </a>
              </li>
              <li className={tab === 'houses' ? 'active' : ''}>
                <a href="#" onClick={e => { e.preventDefault(); setTab('houses'); }}>
                  Guest Houses <span className="badge" style={{ background: '#aaa' }}>{houses.length}</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : tab === 'bookings' ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <select className="form-control input-sm" style={{ width: 160, display: 'inline-block' }}
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Employee ID</th><th>Guest House</th><th>Arrival</th><th>Departure</th>
                        <th>Purpose</th><th>Occupancy</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(b => (
                        <tr key={b.id}>
                          <td>{b.empId}</td>
                          <td>{houseMap[b.guestHouseId as any] ?? b.guestHouseId ?? '—'}</td>
                          <td style={{ fontSize: 12 }}>{b.arrivalDate ?? '—'}</td>
                          <td style={{ fontSize: 12 }}>{b.departureDate ?? '—'}</td>
                          <td style={{ fontSize: 12, maxWidth: 160 }}>{b.purpose ?? '—'}</td>
                          <td style={{ fontSize: 12, textTransform: 'capitalize' }}>{b.occupancy ?? '—'}</td>
                          <td>
                            <span className={`label label-${STATUS_COLOR[b.status ?? ''] ?? 'default'}`} style={{ textTransform: 'capitalize' }}>
                              {b.status ?? '—'}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {b.status === 'pending' && (
                              <>
                                <button className="btn btn-xs btn-success" style={{ marginRight: 4 }}
                                  onClick={() => setStatus(b.id, 'approved')}>
                                  <i className="fa fa-check" />
                                </button>
                                <button className="btn btn-xs btn-danger"
                                  onClick={() => setStatus(b.id, 'rejected')}>
                                  <i className="fa fa-times" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr><th>ID</th><th>Name</th><th>Location ID</th><th>Total Rooms</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {houses.map(h => (
                      <tr key={h.id}>
                        <td>{h.id}</td>
                        <td><strong>{h.name}</strong></td>
                        <td>{h.locationId ?? '—'}</td>
                        <td>{h.totalRooms ?? '—'}</td>
                        <td>
                          <span className={`label label-${h.status === '1' ? 'success' : 'default'}`}>
                            {h.status === '1' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
