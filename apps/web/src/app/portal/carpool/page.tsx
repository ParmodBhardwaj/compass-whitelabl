'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface RideOffer {
  id: number;
  offeredBy: number;
  fromLocation: number;
  toLocation: string;
  toCity?: number;
  arivalTime?: string;
  departureTime?: string;
  car?: string;
  image?: string;
  status?: string;
  createdDate?: string;
  latitude?: string;
  longitude?: string;
}

interface Location { id: number; city?: string; area?: string; }

export default function CarpoolPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [offers, setOffers] = useState<RideOffer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'my'>('all');
  const [fromFilter, setFromFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ toLocation: '', arivalTime: '', departureTime: '', car: '', fromLocation: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await apiFetch<{ id: number }>('/auth/me');
      setUserId(me.id);
      const locs = await apiFetch<Location[]>('/carpool/locations');
      setLocations(locs);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadOffers();
  }, [userId, tab, fromFilter]);

  async function loadOffers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ all: '1' });
      if (tab === 'my') { params.delete('all'); params.set('offeredBy', String(userId)); }
      if (fromFilter) params.set('fromLocation', fromFilter);
      const data = await apiFetch<RideOffer[]>(`/carpool/offers?${params}`);
      setOffers(data);
    } catch {}
    setLoading(false);
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !form.toLocation || !form.departureTime) return;
    setSaving(true);
    try {
      await apiFetch('/carpool/offers', {
        method: 'POST',
        body: JSON.stringify({ ...form, offeredBy: userId }),
      });
      setShowForm(false);
      setForm({ toLocation: '', arivalTime: '', departureTime: '', car: '', fromLocation: 0 });
      await loadOffers();
    } catch {}
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!userId) return;
    await apiFetch(`/carpool/offers/${id}?userId=${userId}`, { method: 'DELETE' });
    setOffers(o => o.filter(x => x.id !== id));
  }

  const locationLabel = (id: number) => {
    const l = locations.find(x => x.id === id);
    return l ? `${l.city ?? ''} ${l.area ?? ''}`.trim() : `Location #${id}`;
  };

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Car Pool</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Car Pool</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(f => !f)}>
            <i className="fa fa-plus" style={{ marginRight: 4 }} />Offer Ride
          </button>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Offer form */}
        {showForm && (
          <div className="ibox float-e-margins">
            <div className="ibox-title"><h5 style={{ margin: 0 }}>Post Ride Offer</h5></div>
            <div className="ibox-content">
              <form onSubmit={handlePost}>
                <div className="row">
                  <div className="col-sm-3">
                    <div className="form-group">
                      <label>From (Office Location)</label>
                      <select className="form-control" value={form.fromLocation}
                        onChange={e => setForm(f => ({ ...f, fromLocation: +e.target.value }))}>
                        <option value={0}>— Select —</option>
                        {locations.map(l => (
                          <option key={l.id} value={l.id}>{l.city} {l.area}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div className="form-group">
                      <label>To Location <span className="text-danger">*</span></label>
                      <input className="form-control" value={form.toLocation}
                        onChange={e => setForm(f => ({ ...f, toLocation: e.target.value }))}
                        placeholder="Destination area/landmark" />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Departure <span className="text-danger">*</span></label>
                      <input className="form-control" type="time" value={form.departureTime}
                        onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Arrival at Office</label>
                      <input className="form-control" type="time" value={form.arivalTime}
                        onChange={e => setForm(f => ({ ...f, arivalTime: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Car</label>
                      <input className="form-control" value={form.car}
                        onChange={e => setForm(f => ({ ...f, car: e.target.value }))}
                        placeholder="e.g. Swift DZire" />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? <i className="fa fa-spinner fa-spin" /> : 'Post Offer'}
                  </button>
                  <button type="button" className="btn btn-white btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              {(['all', 'my'] as const).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}>
                    {t === 'all' ? 'All Offers' : 'My Offers'}
                  </a>
                </li>
              ))}
            </ul>
            <select className="form-control input-sm" style={{ width: 160 }} value={fromFilter}
              onChange={e => setFromFilter(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.city} {l.area}</option>
              ))}
            </select>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 40 }}>
                <i className="fa fa-car fa-3x" style={{ marginBottom: 12 }} />
                <p>No ride offers found.</p>
              </div>
            ) : (
              <div className="row">
                {offers.map(o => (
                  <div key={o.id} className="col-md-4 col-sm-6" style={{ marginBottom: 20 }}>
                    <div style={{ border: '1px solid #e7eaec', borderRadius: 6, overflow: 'hidden' }}>
                      {/* Header */}
                      <div style={{ background: '#1c84c6', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa fa-car" style={{ color: '#fff' }} />
                        </div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                            {locationLabel(o.fromLocation)} → {o.toLocation}
                          </div>
                          {o.car && <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{o.car}</div>}
                        </div>
                      </div>
                      <div style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#555', marginBottom: 8 }}>
                          {o.departureTime && (
                            <div><i className="fa fa-clock-o" style={{ marginRight: 4, color: '#888' }} />Departs: {o.departureTime}</div>
                          )}
                          {o.arivalTime && (
                            <div><i className="fa fa-flag-checkered" style={{ marginRight: 4, color: '#888' }} />Arrives: {o.arivalTime}</div>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          <i className="fa fa-user" style={{ marginRight: 4 }} />Employee #{o.offeredBy}
                          {o.createdDate && (
                            <span style={{ marginLeft: 12 }}>
                              <i className="fa fa-calendar" style={{ marginRight: 4 }} />
                              {new Date(o.createdDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {userId === o.offeredBy && (
                          <button
                            className="btn btn-xs btn-danger"
                            style={{ marginTop: 8 }}
                            onClick={() => handleDelete(o.id)}
                          >
                            <i className="fa fa-trash" style={{ marginRight: 4 }} />Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
