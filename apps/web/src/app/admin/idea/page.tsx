'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Campaign {
  id?: number;
  ideaId?: number;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  createdBy?: number;
  groupAllowed?: string;
}

interface Submission {
  id?: number;
  ideaId?: number;
  submissionTitle?: string;
  submittedBy?: number;
  status?: string;
  createdAt?: string;
}

export default function IdeaAdminPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tab, setTab] = useState<'campaigns' | 'submissions'>('campaigns');
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Campaign>>({ status: 'active', groupAllowed: '0' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [c, s] = await Promise.all([
      apiFetch<Campaign[]>('/idea/campaigns?all=1'),
      apiFetch<Submission[]>('/idea/submissions?all=1'),
    ]);
    setCampaigns(c); setSubmissions(s);
    setLoading(false);
  }

  function getId(c: Campaign): number {
    return (c.id ?? c.ideaId ?? 0) as number;
  }

  function openForm(campaign?: Campaign) {
    setForm(campaign ? { ...campaign } : { status: 'active', groupAllowed: '0' });
    setEditId(campaign ? getId(campaign) : null);
    setShowForm(true);
    setError('');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      if (editId) {
        await apiFetch(`/idea/campaigns/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiFetch('/idea/campaigns', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowForm(false);
      await loadAll();
    } catch { setError('Save failed.'); }
    setSaving(false);
  }

  async function toggleStatus(c: Campaign) {
    const id = getId(c);
    const newStatus = c.status === 'active' ? 'inactive' : 'active';
    await apiFetch(`/idea/campaigns/${id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
    setCampaigns(prev => prev.map(x => getId(x) === id ? { ...x, status: newStatus } : x));
  }

  const subMap: Record<number, number> = {};
  for (const s of submissions) {
    const cid = (s.ideaId ?? 0) as number;
    subMap[cid] = (subMap[cid] ?? 0) + 1;
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Idea Portal — Admin</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Admin</Link></li>
            <li className="active"><strong>Idea Portal</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={() => openForm()}>
            <i className="fa fa-plus" style={{ marginRight: 4 }} />New Campaign
          </button>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Form */}
        {showForm && (
          <div className="ibox float-e-margins">
            <div className="ibox-title"><h5 style={{ margin: 0 }}>{editId ? 'Edit' : 'New'} Campaign</h5></div>
            <div className="ibox-content">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={save}>
                <div className="row">
                  <div className="col-sm-5">
                    <div className="form-group">
                      <label>Campaign Title <span className="text-danger">*</span></label>
                      <input className="form-control" value={form.title ?? ''}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="date" className="form-control" value={form.startDate ?? ''}
                        onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>End Date</label>
                      <input type="date" className="form-control" value={form.endDate ?? ''}
                        onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Status</label>
                      <select className="form-control" value={form.status ?? 'active'}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-1">
                    <div className="form-group">
                      <label>Group?</label>
                      <select className="form-control" value={form.groupAllowed ?? '0'}
                        onChange={e => setForm(f => ({ ...f, groupAllowed: e.target.value }))}>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label>Description</label>
                      <textarea className="form-control" rows={3} value={form.description ?? ''}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? <i className="fa fa-spinner fa-spin" /> : 'Save Campaign'}
                  </button>
                  <button type="button" className="btn btn-white btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              <li className={tab === 'campaigns' ? 'active' : ''}>
                <a href="#" onClick={e => { e.preventDefault(); setTab('campaigns'); }}>
                  Campaigns <span className="badge" style={{ background: '#aaa' }}>{campaigns.length}</span>
                </a>
              </li>
              <li className={tab === 'submissions' ? 'active' : ''}>
                <a href="#" onClick={e => { e.preventDefault(); setTab('submissions'); }}>
                  Submissions <span className="badge" style={{ background: '#aaa' }}>{submissions.length}</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : tab === 'campaigns' ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr><th>Campaign</th><th>Start</th><th>End</th><th>Group</th><th>Submissions</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => {
                      const cid = getId(c);
                      return (
                        <tr key={cid}>
                          <td><strong>{c.title ?? '—'}</strong></td>
                          <td style={{ fontSize: 12 }}>{c.startDate ?? '—'}</td>
                          <td style={{ fontSize: 12 }}>{c.endDate ?? '—'}</td>
                          <td><span className="label label-default">{c.groupAllowed === '1' ? 'Yes' : 'No'}</span></td>
                          <td>
                            <span className="badge" style={{ background: '#1c84c6' }}>{subMap[cid] ?? 0}</span>
                          </td>
                          <td>
                            <span className={`label label-${c.status === 'active' ? 'success' : 'default'}`} style={{ textTransform: 'capitalize' }}>
                              {c.status ?? '—'}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <button className="btn btn-xs btn-default" style={{ marginRight: 4 }} onClick={() => openForm(c)}>
                              <i className="fa fa-pencil" />
                            </button>
                            <button
                              className={`btn btn-xs btn-${c.status === 'active' ? 'warning' : 'success'}`}
                              onClick={() => toggleStatus(c)}
                              title={c.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              <i className={`fa fa-${c.status === 'active' ? 'pause' : 'play'}`} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr><th>Title</th><th>Campaign ID</th><th>Submitted By</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {submissions.map((s, i) => (
                      <tr key={s.id ?? i}>
                        <td><strong style={{ fontSize: 13 }}>{s.submissionTitle ?? '—'}</strong></td>
                        <td style={{ fontSize: 12 }}>{s.ideaId ?? '—'}</td>
                        <td style={{ fontSize: 12 }}>{s.submittedBy ?? '—'}</td>
                        <td>
                          <span className={`label label-${s.status === 'approved' ? 'success' : s.status === 'rejected' ? 'danger' : 'warning'}`} style={{ textTransform: 'capitalize' }}>
                            {s.status ?? 'submitted'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#888' }}>
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {submissions.length === 0 && (
                  <div className="text-center text-muted" style={{ padding: 24 }}>No submissions yet.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
