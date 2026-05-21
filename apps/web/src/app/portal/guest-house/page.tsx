'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface GuestHouse {
  id: number;
  name: string;
  alias?: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  emailId?: string;
  image?: string;
  singleOccupancy?: number;
  doubleOccupancy?: number;
  status?: string;
}

interface Booking {
  id: number;
  empId: number;
  guestHouseId: string;
  departureDate?: string;
  arrivalDate?: string;
  purpose?: string;
  occupancy?: string;
  status?: string;
  creationDate?: string;
}

interface Stats { total: number; pending: number; approved: number; rejected: number; }

const STATUS_COLOR: Record<string, string> = {
  pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'default',
};

export default function GuestHousePage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [houses, setHouses] = useState<GuestHouse[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'houses' | 'bookings'>('houses');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    guestHouseId: '', departureDate: '', departureTime: '10:00',
    arrivalDate: '', arrivalTime: '12:00', purpose: '', mobile: '', occupancy: 'single',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const me = await apiFetch<{ id: number }>('/auth/me');
      setUserId(me.id);
      const [hs, bks, st] = await Promise.all([
        apiFetch<GuestHouse[]>('/guest-house/houses'),
        apiFetch<Booking[]>(`/guest-house/bookings?empId=${me.id}`),
        apiFetch<Stats>(`/guest-house/stats?empId=${me.id}`),
      ]);
      setHouses(hs);
      setBookings(bks);
      setStats(st);
      setLoading(false);
    })();
  }, []);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!form.guestHouseId || !form.departureDate || !form.arrivalDate || !form.purpose || !form.mobile) {
      setError('All fields are required.');
      return;
    }
    if (!userId) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch('/guest-house/bookings', {
        method: 'POST',
        body: JSON.stringify({ ...form, empId: userId }),
      });
      const [bks, st] = await Promise.all([
        apiFetch<Booking[]>(`/guest-house/bookings?empId=${userId}`),
        apiFetch<Stats>(`/guest-house/stats?empId=${userId}`),
      ]);
      setBookings(bks);
      setStats(st);
      setShowForm(false);
      setForm({ guestHouseId: '', departureDate: '', departureTime: '10:00', arrivalDate: '', arrivalTime: '12:00', purpose: '', mobile: '', occupancy: 'single' });
    } catch {
      setError('Failed to submit booking request.');
    }
    setSaving(false);
  }

  async function cancelBooking(id: number) {
    if (!userId) return;
    await apiFetch(`/guest-house/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ empId: userId }),
    });
    setBookings(b => b.map(x => x.id === id ? { ...x, status: 'cancelled' } : x));
  }

  const houseById = (id: string) => houses.find(h => String(h.id) === id);

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Guest House</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Guest House</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(f => !f); setTab('bookings'); }}>
            <i className="fa fa-plus" style={{ marginRight: 4 }} />Book Room
          </button>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Stats */}
        <div className="row" style={{ marginBottom: 16 }}>
          {[
            { label: 'My Bookings', value: stats.total, bg: '#1c84c6' },
            { label: 'Pending', value: stats.pending, bg: '#f8ac59' },
            { label: 'Approved', value: stats.approved, bg: '#1ab394' },
            { label: 'Rejected', value: stats.rejected, bg: '#ed5565' },
          ].map(({ label, value, bg }) => (
            <div key={label} className="col-lg-3 col-sm-6" style={{ marginBottom: 8 }}>
              <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
                <div className="ibox-content" style={{ background: bg, color: '#fff', borderRadius: 4, padding: '16px 20px' }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              {(['houses', 'bookings'] as const).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); setShowForm(false); }}
                    style={{ textTransform: 'capitalize' }}>
                    {t === 'houses' ? `Guest Houses (${houses.length})` : `My Bookings (${bookings.length})`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : tab === 'houses' ? (
              houses.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: 40 }}>No guest houses available.</div>
              ) : (
                <div className="row">
                  {houses.map(h => (
                    <div key={h.id} className="col-md-4 col-sm-6" style={{ marginBottom: 20 }}>
                      <div style={{ border: '1px solid #e7eaec', borderRadius: 6, overflow: 'hidden' }}>
                        {h.image ? (
                          <img src={`/api/uploads/${h.image}`} alt={h.name}
                            style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ height: 100, background: '#1c84c6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa fa-home fa-3x" style={{ color: 'rgba(255,255,255,0.6)' }} />
                          </div>
                        )}
                        <div style={{ padding: '12px 14px' }}>
                          <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>{h.name}</h4>
                          {h.address && <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}><i className="fa fa-map-marker" style={{ marginRight: 4 }} />{h.address}</div>}
                          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#555', marginBottom: 8 }}>
                            <div><i className="fa fa-user" style={{ marginRight: 4 }} />Single: {h.singleOccupancy ?? 0}</div>
                            <div><i className="fa fa-users" style={{ marginRight: 4 }} />Double: {h.doubleOccupancy ?? 0}</div>
                          </div>
                          <button className="btn btn-primary btn-xs"
                            onClick={() => { setForm(f => ({ ...f, guestHouseId: String(h.id) })); setTab('bookings'); setShowForm(true); }}>
                            Book This House
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <>
                {showForm && (
                  <div style={{ marginBottom: 20, padding: 16, background: '#f9f9f9', borderRadius: 4, border: '1px solid #e7eaec' }}>
                    <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>New Booking Request</h5>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleBook}>
                      <div className="row">
                        <div className="col-sm-4">
                          <div className="form-group">
                            <label>Guest House <span className="text-danger">*</span></label>
                            <select className="form-control" value={form.guestHouseId}
                              onChange={e => setForm(f => ({ ...f, guestHouseId: e.target.value }))}>
                              <option value="">— Select —</option>
                              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-2">
                          <div className="form-group">
                            <label>Occupancy</label>
                            <select className="form-control" value={form.occupancy}
                              onChange={e => setForm(f => ({ ...f, occupancy: e.target.value }))}>
                              <option value="single">Single</option>
                              <option value="double">Double</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-2">
                          <div className="form-group">
                            <label>Check-in Date <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" value={form.departureDate}
                              onChange={e => setForm(f => ({ ...f, departureDate: e.target.value }))} />
                          </div>
                        </div>
                        <div className="col-sm-2">
                          <div className="form-group">
                            <label>Check-out Date <span className="text-danger">*</span></label>
                            <input type="date" className="form-control" value={form.arrivalDate}
                              onChange={e => setForm(f => ({ ...f, arrivalDate: e.target.value }))} />
                          </div>
                        </div>
                        <div className="col-sm-2">
                          <div className="form-group">
                            <label>Mobile <span className="text-danger">*</span></label>
                            <input type="tel" className="form-control" value={form.mobile}
                              onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <div className="form-group">
                            <label>Purpose <span className="text-danger">*</span></label>
                            <textarea className="form-control" rows={2} value={form.purpose}
                              onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                          {saving ? <i className="fa fa-spinner fa-spin" /> : 'Submit Request'}
                        </button>
                        <button type="button" className="btn btn-white btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {bookings.length === 0 ? (
                  <div className="text-center text-muted" style={{ padding: 40 }}>
                    <i className="fa fa-calendar fa-3x" style={{ marginBottom: 12 }} />
                    <p>No bookings yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Guest House</th>
                          <th>Check-in</th>
                          <th>Check-out</th>
                          <th>Occupancy</th>
                          <th>Status</th>
                          <th>Booked On</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => {
                          const house = houseById(b.guestHouseId);
                          return (
                            <tr key={b.id}>
                              <td style={{ color: '#999', fontSize: 12 }}>{b.id}</td>
                              <td style={{ fontWeight: 500 }}>{house?.name ?? `House #${b.guestHouseId}`}</td>
                              <td style={{ fontSize: 13 }}>{b.departureDate ?? '—'}</td>
                              <td style={{ fontSize: 13 }}>{b.arrivalDate ?? '—'}</td>
                              <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{b.occupancy ?? '—'}</td>
                              <td>
                                <span className={`label label-${STATUS_COLOR[b.status ?? ''] ?? 'default'}`}
                                  style={{ textTransform: 'capitalize' }}>
                                  {b.status ?? '—'}
                                </span>
                              </td>
                              <td style={{ fontSize: 12, color: '#888' }}>
                                {b.creationDate ? new Date(b.creationDate).toLocaleDateString() : '—'}
                              </td>
                              <td>
                                {b.status === 'pending' && (
                                  <button className="btn btn-xs btn-danger" onClick={() => cancelBooking(b.id)}>Cancel</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
