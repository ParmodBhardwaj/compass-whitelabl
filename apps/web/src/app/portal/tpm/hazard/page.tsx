'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface HazardItem {
  id: number;
  description?: string;
  riskLevel?: string;
  status?: string;
  endDate?: string;
  createdAt?: string;
  plantId?: number;
  categoryId?: number;
  impactId?: number;
}

interface MetaItem { id: number; title?: string; name?: string; plantName?: string; }

type TabFilter = 'my' | 'all';

const RISK_COLOR: Record<string, string> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'success',
};

const STATUS_COLOR: Record<string, string> = {
  open: 'primary',
  in_progress: 'info',
  closed: 'success',
  rejected: 'default',
};

export default function HazardListPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [rows, setRows] = useState<HazardItem[]>([]);
  const [plants, setPlants] = useState<MetaItem[]>([]);
  const [tab, setTab] = useState<TabFilter>('my');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Create form state
  const [meta, setMeta] = useState<{
    categories: MetaItem[];
    subCategories: MetaItem[];
    impacts: MetaItem[];
    auditTypes: MetaItem[];
    applications: MetaItem[];
  }>({ categories: [], subCategories: [], impacts: [], auditTypes: [], applications: [] });
  const [form, setForm] = useState({
    description: '', plantId: '', applicationId: '', departmentId: '',
    categoryId: '', subCategoryId: '', impactId: '', auditType: '',
    riskLevel: 'Low', endDate: '', photo: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<{ id: number }>('/auth/me');
        setUserId(me.id);
        const [plantList, apps, cats, impacts, auditTypes] = await Promise.all([
          apiFetch<MetaItem[]>('/tpm/meta/plants'),
          apiFetch<MetaItem[]>('/tpm/meta/applications'),
          apiFetch<MetaItem[]>('/tpm/meta/hazard-categories'),
          apiFetch<MetaItem[]>('/tpm/meta/hazard-impacts'),
          apiFetch<MetaItem[]>('/tpm/meta/hazard-audit-types'),
        ]);
        setPlants(Array.isArray(plantList) ? plantList : []);
        setMeta(m => ({ ...m, applications: Array.isArray(apps) ? apps : [], categories: Array.isArray(cats) ? cats : [], impacts: Array.isArray(impacts) ? impacts : [], auditTypes: Array.isArray(auditTypes) ? auditTypes : [] }));
        const hazards = await apiFetch<HazardItem[]>(`/tpm/hazard?userId=${me.id}`);
        setRows(Array.isArray(hazards) ? hazards : []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (userId === null) return;
    setLoading(true);
    const url = tab === 'all' ? '/tpm/hazard?all=1' : `/tpm/hazard?userId=${userId}`;
    apiFetch<HazardItem[]>(url)
      .then(d => setRows(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, userId]);

  // Load sub-categories when category changes
  useEffect(() => {
    if (!form.categoryId) return;
    apiFetch<MetaItem[]>(`/tpm/meta/hazard-sub-categories?categoryId=${form.categoryId}`)
      .then(d => setMeta(m => ({ ...m, subCategories: Array.isArray(d) ? d : [] })))
      .catch(() => {});
  }, [form.categoryId]);

  const filtered = useMemo(() => {
    let list = rows;
    if (statusFilter) list = list.filter(r => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => (r.description ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [rows, statusFilter, search]);

  async function submitHazard(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      await apiFetch('/tpm/hazard', {
        method: 'POST',
        body: JSON.stringify({ ...form, createdBy: userId, plantId: +form.plantId, applicationId: +form.applicationId, categoryId: +form.categoryId, subCategoryId: +form.subCategoryId, impactId: +form.impactId, auditType: +form.auditType }),
      });
      const hazards = await apiFetch<HazardItem[]>(`/tpm/hazard?userId=${userId}`);
      setRows(Array.isArray(hazards) ? hazards : []);
      setShowForm(false);
      setForm({ description: '', plantId: '', applicationId: '', departmentId: '', categoryId: '', subCategoryId: '', impactId: '', auditType: '', riskLevel: 'Low', endDate: '', photo: '' });
    } catch {}
    setSaving(false);
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Hazard Redressal</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/tpm">TPM</Link></li>
            <li className="active"><strong>Hazard</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(f => !f)}>
            <i className="fa fa-plus" style={{ marginRight: 4 }} />Raise Hazard
          </button>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>

        {/* Create form */}
        {showForm && (
          <div className="ibox float-e-margins">
            <div className="ibox-title">
              <h5 style={{ margin: 0 }}>Raise New Hazard</h5>
            </div>
            <div className="ibox-content">
              <form onSubmit={submitHazard}>
                <div className="row">
                  <div className="col-sm-4">
                    <div className="form-group">
                      <label>Plant <span className="text-danger">*</span></label>
                      <select className="form-control" required value={form.plantId} onChange={e => setForm(f => ({ ...f, plantId: e.target.value }))}>
                        <option value="">— Select —</option>
                        {plants.map(p => <option key={p.id} value={p.id}>{p.plantName ?? p.name ?? p.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group">
                      <label>Application <span className="text-danger">*</span></label>
                      <select className="form-control" required value={form.applicationId} onChange={e => setForm(f => ({ ...f, applicationId: e.target.value }))}>
                        <option value="">— Select —</option>
                        {meta.applications.map(a => <option key={a.id} value={a.id}>{a.name ?? a.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group">
                      <label>Risk Level</label>
                      <select className="form-control" value={form.riskLevel} onChange={e => setForm(f => ({ ...f, riskLevel: e.target.value }))}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group">
                      <label>Category <span className="text-danger">*</span></label>
                      <select className="form-control" required value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value, subCategoryId: '' }))}>
                        <option value="">— Select —</option>
                        {meta.categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group">
                      <label>Sub-category</label>
                      <select className="form-control" value={form.subCategoryId} onChange={e => setForm(f => ({ ...f, subCategoryId: e.target.value }))}>
                        <option value="">— Select —</option>
                        {meta.subCategories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group">
                      <label>Impact <span className="text-danger">*</span></label>
                      <select className="form-control" required value={form.impactId} onChange={e => setForm(f => ({ ...f, impactId: e.target.value }))}>
                        <option value="">— Select —</option>
                        {meta.impacts.map(i => <option key={i.id} value={i.id}>{i.title ?? i.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group">
                      <label>Audit Type <span className="text-danger">*</span></label>
                      <select className="form-control" required value={form.auditType} onChange={e => setForm(f => ({ ...f, auditType: e.target.value }))}>
                        <option value="">— Select —</option>
                        {meta.auditTypes.map(a => <option key={a.id} value={a.id}>{a.title ?? a.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group">
                      <label>Target Redressal Date</label>
                      <input type="date" className="form-control" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label>Description <span className="text-danger">*</span></label>
                      <textarea className="form-control" rows={3} required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the hazard..." />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-danger btn-sm" disabled={saving}>
                    {saving ? <><i className="fa fa-spinner fa-spin" /> Raising…</> : 'Raise Hazard'}
                  </button>
                  <button type="button" className="btn btn-white btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ margin: 0 }}>Hazard Requests</h5>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-control input-sm" style={{ width: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
              <input className="form-control input-sm" style={{ width: 180 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="ibox-content">
            <ul className="nav nav-tabs" style={{ marginBottom: 16 }}>
              {(['my', 'all'] as TabFilter[]).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}>
                    {t === 'my' ? 'My Hazards' : 'All Hazards'}
                  </a>
                </li>
              ))}
            </ul>

            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted" style={{ padding: 30 }}>No hazard requests found.</p>
            ) : (
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Description</th>
                    <th style={{ width: 90, textAlign: 'center' }}>Risk</th>
                    <th style={{ width: 100 }}>Target Date</th>
                    <th style={{ width: 100, textAlign: 'center' }}>Status</th>
                    <th style={{ width: 80 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td style={{ verticalAlign: 'middle', color: '#999' }}>{r.id}</td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <Link href={`/portal/tpm/hazard/${r.id}`} style={{ fontWeight: 600 }}>
                          {(r.description ?? '').slice(0, 80)}{(r.description?.length ?? 0) > 80 ? '…' : ''}
                        </Link>
                      </td>
                      <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                        <span className={`label label-${RISK_COLOR[r.riskLevel ?? ''] ?? 'default'}`}>{r.riskLevel ?? '—'}</span>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>{r.endDate ?? '—'}</td>
                      <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                        <span className={`label label-${STATUS_COLOR[r.status ?? ''] ?? 'default'}`}>{r.status?.replace('_', ' ') ?? '—'}</span>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <Link href={`/portal/tpm/hazard/${r.id}`} className="btn btn-xs btn-primary">
                          <i className="fa fa-eye" style={{ marginRight: 3 }} />View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
