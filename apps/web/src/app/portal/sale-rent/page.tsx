'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Listing {
  id: number;
  userId: number;
  title: string;
  type?: string;
  categoryId?: number;
  location?: string;
  price?: number;
  description?: string;
  image?: string;
  status?: string;
  creationDate?: string;
}

interface Category { id: number; title: string; }
interface Stats { total: number; active: number; sold: number; rent: number; sale: number; }

const TYPE_COLORS: Record<string, string> = { sale: 'primary', rent: 'warning' };
const STATUS_COLORS: Record<string, string> = { active: 'success', sold: 'default', deleted: 'danger' };

export default function SaleRentPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, sold: 0, rent: 0, sale: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'my'>('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'sale', location: '', price: '', description: '', image: '', categoryId: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await apiFetch<{ id: number }>('/auth/me');
      setUserId(me.id);
      const cats = await apiFetch<Category[]>('/sale-rent/categories');
      setCategories(cats);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadListings();
  }, [userId, tab, typeFilter, catFilter, search]);

  async function loadListings() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab === 'all') params.set('all', '1');
      else params.set('userId', String(userId));
      if (typeFilter) params.set('type', typeFilter);
      if (catFilter) params.set('categoryId', catFilter);
      if (search) params.set('search', search);
      const [data, st] = await Promise.all([
        apiFetch<Listing[]>(`/sale-rent/listings?${params}`),
        apiFetch<Stats>(`/sale-rent/stats${tab === 'my' ? `?userId=${userId}` : ''}`),
      ]);
      setListings(data);
      setStats(st);
    } catch {}
    setLoading(false);
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !form.title || !form.price) return;
    setSaving(true);
    try {
      await apiFetch('/sale-rent/listings', {
        method: 'POST',
        body: JSON.stringify({
          ...form, price: +form.price,
          categoryId: form.categoryId || undefined,
          userId,
        }),
      });
      setShowForm(false);
      setForm({ title: '', type: 'sale', location: '', price: '', description: '', image: '', categoryId: 0 });
      await loadListings();
    } catch {}
    setSaving(false);
  }

  async function markSold(id: number) {
    if (!userId) return;
    await apiFetch(`/sale-rent/listings/${id}/sold`, { method: 'PUT', body: JSON.stringify({ userId }) });
    setListings(l => l.map(x => x.id === id ? { ...x, status: 'sold' } : x));
  }

  async function deleteListing(id: number) {
    if (!userId) return;
    await apiFetch(`/sale-rent/listings/${id}?userId=${userId}`, { method: 'DELETE' });
    setListings(l => l.filter(x => x.id !== id));
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Sale & Rent</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Sale & Rent</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(f => !f)}>
            <i className="fa fa-plus" style={{ marginRight: 4 }} />Post Listing
          </button>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Stats tiles */}
        <div className="row" style={{ marginBottom: 16 }}>
          {[
            { label: 'Total', value: stats.total, bg: '#1c84c6' },
            { label: 'Active', value: stats.active, bg: '#1ab394' },
            { label: 'For Sale', value: stats.sale, bg: '#f8ac59' },
            { label: 'For Rent', value: stats.rent, bg: '#23c6c8' },
            { label: 'Sold', value: stats.sold, bg: '#888' },
          ].map(({ label, value, bg }) => (
            <div key={label} className="col-lg-2 col-sm-4" style={{ marginBottom: 8 }}>
              <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
                <div className="ibox-content" style={{ background: bg, color: '#fff', borderRadius: 4, padding: '14px 18px' }}>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Post listing form */}
        {showForm && (
          <div className="ibox float-e-margins">
            <div className="ibox-title"><h5 style={{ margin: 0 }}>New Listing</h5></div>
            <div className="ibox-content">
              <form onSubmit={handlePost}>
                <div className="row">
                  <div className="col-sm-4">
                    <div className="form-group">
                      <label>Title <span className="text-danger">*</span></label>
                      <input className="form-control" value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Type</label>
                      <select className="form-control" value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Category</label>
                      <select className="form-control" value={form.categoryId}
                        onChange={e => setForm(f => ({ ...f, categoryId: +e.target.value }))}>
                        <option value={0}>— None —</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Price (₹) <span className="text-danger">*</span></label>
                      <input className="form-control" type="number" value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Location</label>
                      <input className="form-control" value={form.location}
                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label>Description</label>
                      <textarea className="form-control" rows={3} value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? <i className="fa fa-spinner fa-spin" /> : 'Post'}
                  </button>
                  <button type="button" className="btn btn-white btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters + grid */}
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              {(['all', 'my'] as const).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}>
                    {t === 'all' ? 'All Listings' : 'My Listings'}
                  </a>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-control input-sm" style={{ width: 160 }} placeholder="Search…"
                value={search} onChange={e => setSearch(e.target.value)} />
              <select className="form-control input-sm" style={{ width: 110 }} value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
              <select className="form-control input-sm" style={{ width: 130 }} value={catFilter}
                onChange={e => setCatFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : listings.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 40 }}>
                <i className="fa fa-tag fa-3x" style={{ marginBottom: 12 }} />
                <p>No listings found.</p>
              </div>
            ) : (
              <div className="row">
                {listings.map(l => (
                  <div key={l.id} className="col-md-3 col-sm-6" style={{ marginBottom: 20 }}>
                    <div style={{ border: '1px solid #e7eaec', borderRadius: 6, overflow: 'hidden' }}>
                      {l.image ? (
                        <img src={`/api/uploads/${l.image}`} alt={l.title}
                          style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: 80, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa fa-image fa-2x text-muted" />
                        </div>
                      )}
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span className={`label label-${TYPE_COLORS[l.type ?? ''] ?? 'default'}`}
                            style={{ textTransform: 'capitalize', fontSize: 10 }}>
                            {l.type ?? '—'}
                          </span>
                          {l.status !== 'active' && (
                            <span className={`label label-${STATUS_COLORS[l.status ?? ''] ?? 'default'}`}
                              style={{ fontSize: 10, textTransform: 'capitalize' }}>
                              {l.status}
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{l.title}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1ab394', marginBottom: 4 }}>
                          ₹{Number(l.price ?? 0).toLocaleString()}
                        </div>
                        {l.location && (
                          <div style={{ fontSize: 12, color: '#888' }}>
                            <i className="fa fa-map-marker" style={{ marginRight: 4 }} />{l.location}
                          </div>
                        )}
                        {userId === l.userId && l.status === 'active' && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                            <button className="btn btn-xs btn-success" onClick={() => markSold(l.id)}>Sold</button>
                            <button className="btn btn-xs btn-danger" onClick={() => deleteListing(l.id)}>Remove</button>
                          </div>
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
