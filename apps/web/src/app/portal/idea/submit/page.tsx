'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface Campaign {
  ideaId: number;
  title: string;
  status?: string;
  startForm?: string;
  startEnd?: string;
  teamSize?: number;
}

interface Category {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name?: string;
  empCode?: string;
}

/**
 * Next.js 14 requires `useSearchParams()` consumers to live inside a
 * Suspense boundary or the prod build fails. Wrap and forward.
 */
export default function SubmitIdeaPage() {
  return (
    <Suspense fallback={null}>
      <SubmitIdeaInner />
    </Suspense>
  );
}

function SubmitIdeaInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignIdParam = searchParams.get('campaignId');

  const [userId, setUserId] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    ideaId: campaignIdParam ? +campaignIdParam : 0,
    categoryId: 0,
    title: '',
    shortDescription: '',
    description: '',
    attachment: '',
    isGroup: '0',
    teamUserIds: [] as number[],
  });

  useEffect(() => {
    (async () => {
      try {
        const [me, active] = await Promise.all([
          apiFetch<{ id: number }>('/auth/me'),
          apiFetch<Campaign[]>('/idea/campaigns/active'),
        ]);
        setUserId(me.id);
        setCampaigns(active);
        // If campaignId provided, load its categories
        if (campaignIdParam) loadCategories(+campaignIdParam);
      } catch {}
      setLoading(false);
    })();
  }, [campaignIdParam]);

  // Load employees for group submission
  useEffect(() => {
    if (form.isGroup === '1' && !employees.length) {
      apiFetch<Employee[]>('/employee?limit=200').then(setEmployees).catch(() => {});
    }
  }, [form.isGroup]);

  async function loadCategories(id: number) {
    try {
      const detail = await apiFetch<{ categories: Category[] }>(`/idea/campaigns/${id}`);
      setCategories(detail.categories);
    } catch {
      setCategories([]);
    }
  }

  function handleCampaignChange(id: number) {
    setForm(f => ({ ...f, ideaId: id, categoryId: 0 }));
    if (id) loadCategories(id);
    else setCategories([]);
  }

  function toggleTeamMember(uid: number) {
    setForm(f => ({
      ...f,
      teamUserIds: f.teamUserIds.includes(uid)
        ? f.teamUserIds.filter(x => x !== uid)
        : [...f.teamUserIds, uid],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ideaId || !form.title.trim() || !form.description.trim()) {
      setError('Campaign, Title, and Description are required.');
      return;
    }
    if (!userId) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch('/idea/submissions', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || undefined,
          submittedBy: userId,
          teamUserIds: form.isGroup === '1' ? form.teamUserIds : undefined,
        }),
      });
      router.push('/portal/idea/my-submissions');
    } catch {
      setError('Failed to submit idea. Please try again.');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="ibox"><div className="ibox-content text-center" style={{ padding: 40 }}>
          <i className="fa fa-spinner fa-spin fa-2x text-muted" />
        </div></div>
      </div>
    );
  }

  const selectedCampaign = campaigns.find(c => c.ideaId === form.ideaId);

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Submit Idea</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/idea">Idea Portal</Link></li>
            <li className="active"><strong>Submit Idea</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-md-8 col-md-offset-2">
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>New Idea Submission</h5></div>
              <div className="ibox-content">
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  {/* Campaign */}
                  <div className="form-group">
                    <label>Campaign <span className="text-danger">*</span></label>
                    <select
                      className="form-control"
                      value={form.ideaId}
                      onChange={e => handleCampaignChange(+e.target.value)}
                      disabled={!!campaignIdParam}
                    >
                      <option value={0}>— Select campaign —</option>
                      {campaigns.map(c => (
                        <option key={c.ideaId} value={c.ideaId}>{c.title}</option>
                      ))}
                    </select>
                    {selectedCampaign?.startEnd && (
                      <span className="help-block" style={{ fontSize: 12 }}>
                        Campaign closes: {new Date(selectedCampaign.startEnd).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Category */}
                  {categories.length > 0 && (
                    <div className="form-group">
                      <label>Category</label>
                      <select className="form-control" value={form.categoryId}
                        onChange={e => setForm(f => ({ ...f, categoryId: +e.target.value }))}>
                        <option value={0}>— No category —</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Submission type */}
                  <div className="form-group">
                    <label>Submission Type</label>
                    <div>
                      <label className="radio-inline">
                        <input type="radio" value="0" checked={form.isGroup === '0'}
                          onChange={() => setForm(f => ({ ...f, isGroup: '0', teamUserIds: [] }))} />
                        {' '}Individual
                      </label>
                      <label className="radio-inline" style={{ marginLeft: 16 }}>
                        <input type="radio" value="1" checked={form.isGroup === '1'}
                          onChange={() => setForm(f => ({ ...f, isGroup: '1' }))} />
                        {' '}Group
                        {selectedCampaign?.teamSize && ` (max ${selectedCampaign.teamSize} members)`}
                      </label>
                    </div>
                  </div>

                  {/* Group members */}
                  {form.isGroup === '1' && employees.length > 0 && (
                    <div className="form-group">
                      <label>Team Members</label>
                      <div style={{
                        maxHeight: 180, overflowY: 'auto', border: '1px solid #e5e6e7',
                        borderRadius: 4, padding: '8px 12px',
                      }}>
                        {employees.filter(e => e.id !== userId).map(emp => (
                          <label key={emp.id} style={{ display: 'block', fontWeight: 'normal', marginBottom: 4, cursor: 'pointer' }}>
                            <input type="checkbox"
                              checked={form.teamUserIds.includes(emp.id)}
                              onChange={() => toggleTeamMember(emp.id)}
                              style={{ marginRight: 6 }}
                            />
                            {emp.name ?? `Employee #${emp.id}`}
                            {emp.empCode && <span style={{ color: '#999', marginLeft: 6, fontSize: 12 }}>({emp.empCode})</span>}
                          </label>
                        ))}
                      </div>
                      <span className="help-block" style={{ fontSize: 12 }}>
                        {form.teamUserIds.length} member(s) selected
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <div className="form-group">
                    <label>Idea Title <span className="text-danger">*</span></label>
                    <input className="form-control" type="text" placeholder="Give your idea a clear title"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>

                  {/* Short description */}
                  <div className="form-group">
                    <label>Short Description</label>
                    <input className="form-control" type="text"
                      placeholder="One-line summary of your idea (optional)"
                      value={form.shortDescription}
                      onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} />
                  </div>

                  {/* Full description */}
                  <div className="form-group">
                    <label>Full Description <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows={6}
                      placeholder="Describe your idea in detail — problem, solution, expected benefits..."
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>

                  {/* Attachment */}
                  <div className="form-group">
                    <label>Attachment (filename)</label>
                    <input className="form-control" type="text"
                      placeholder="Filename of uploaded attachment (optional)"
                      value={form.attachment}
                      onChange={e => setForm(f => ({ ...f, attachment: e.target.value }))} />
                    <span className="help-block" style={{ fontSize: 12 }}>
                      Upload the file separately via the upload endpoint, then paste the filename here.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 4 }} />Submitting…</> : 'Submit Idea'}
                    </button>
                    <Link href="/portal/idea" className="btn btn-white">Cancel</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
