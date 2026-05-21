'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface TaxDoc {
  id: number;
  title: string;
  documentName?: string;
  documentType?: string;
  sectionId?: number;
  status?: string;
  createdAt?: string;
}

interface TaxFaq {
  id: number;
  question: string;
  answer: string;
  status?: string;
}

interface TaxLink {
  id: number;
  title: string;
  link: string;
  linkType?: string;
  status?: string;
}

type Tab = 'docs' | 'faqs' | 'links';

const DOC_TYPES = ['pdf', 'doc', 'xls', 'ppt', 'xlsx', 'docx'];
const LINK_TYPES = ['internal', 'external', 'government', 'reference'];

export default function TaxAdminPage() {
  const [tab, setTab] = useState<Tab>('docs');
  const [docs, setDocs] = useState<TaxDoc[]>([]);
  const [faqs, setFaqs] = useState<TaxFaq[]>([]);
  const [links, setLinks] = useState<TaxLink[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Form state ──
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState<Partial<TaxDoc>>({});
  const [editDocId, setEditDocId] = useState<number | null>(null);

  const [showFaqForm, setShowFaqForm] = useState(false);
  const [faqForm, setFaqForm] = useState<Partial<TaxFaq>>({});
  const [editFaqId, setEditFaqId] = useState<number | null>(null);

  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkForm, setLinkForm] = useState<Partial<TaxLink>>({});
  const [editLinkId, setEditLinkId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [d, f, l] = await Promise.all([
      apiFetch<TaxDoc[]>('/tax/documents?all=1'),
      apiFetch<TaxFaq[]>('/tax/faqs?all=1'),
      apiFetch<TaxLink[]>('/tax/hyperlinks?all=1'),
    ]);
    setDocs(d); setFaqs(f); setLinks(l);
    setLoading(false);
  }

  // ── Doc CRUD ─────────────────────────────────────────────────────────────────

  function openDocForm(doc?: TaxDoc) {
    setDocForm(doc ?? { status: '1' });
    setEditDocId(doc?.id ?? null);
    setShowDocForm(true);
    setError('');
  }

  async function saveDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!docForm.title) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      if (editDocId) {
        await apiFetch(`/tax/documents/${editDocId}`, { method: 'PUT', body: JSON.stringify(docForm) });
      } else {
        await apiFetch('/tax/documents', { method: 'POST', body: JSON.stringify(docForm) });
      }
      setShowDocForm(false);
      await loadAll();
    } catch { setError('Save failed.'); }
    setSaving(false);
  }

  async function deleteDoc(id: number) {
    if (!confirm('Delete this document?')) return;
    await apiFetch(`/tax/documents/${id}`, { method: 'DELETE' });
    setDocs(d => d.filter(x => x.id !== id));
  }

  // ── FAQ CRUD ──────────────────────────────────────────────────────────────────

  function openFaqForm(faq?: TaxFaq) {
    setFaqForm(faq ?? { status: '1' });
    setEditFaqId(faq?.id ?? null);
    setShowFaqForm(true);
    setError('');
  }

  async function saveFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer) { setError('Question and Answer are required'); return; }
    setSaving(true); setError('');
    try {
      if (editFaqId) {
        await apiFetch(`/tax/faqs/${editFaqId}`, { method: 'PUT', body: JSON.stringify(faqForm) });
      } else {
        await apiFetch('/tax/faqs', { method: 'POST', body: JSON.stringify(faqForm) });
      }
      setShowFaqForm(false);
      await loadAll();
    } catch { setError('Save failed.'); }
    setSaving(false);
  }

  async function deleteFaq(id: number) {
    if (!confirm('Delete this FAQ?')) return;
    await apiFetch(`/tax/faqs/${id}`, { method: 'DELETE' });
    setFaqs(f => f.filter(x => x.id !== id));
  }

  // ── Link CRUD ─────────────────────────────────────────────────────────────────

  function openLinkForm(link?: TaxLink) {
    setLinkForm(link ?? { status: '1' });
    setEditLinkId(link?.id ?? null);
    setShowLinkForm(true);
    setError('');
  }

  async function saveLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkForm.title || !linkForm.link) { setError('Title and URL are required'); return; }
    setSaving(true); setError('');
    try {
      if (editLinkId) {
        await apiFetch(`/tax/hyperlinks/${editLinkId}`, { method: 'PUT', body: JSON.stringify(linkForm) });
      } else {
        await apiFetch('/tax/hyperlinks', { method: 'POST', body: JSON.stringify(linkForm) });
      }
      setShowLinkForm(false);
      await loadAll();
    } catch { setError('Save failed.'); }
    setSaving(false);
  }

  async function deleteLink(id: number) {
    if (!confirm('Delete this link?')) return;
    await apiFetch(`/tax/hyperlinks/${id}`, { method: 'DELETE' });
    setLinks(l => l.filter(x => x.id !== id));
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Tax Insight — Admin</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Admin</Link></li>
            <li className="active"><strong>Tax Documents</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              {(['docs', 'faqs', 'links'] as Tab[]).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}>
                    {t === 'docs' ? 'Documents' : t === 'faqs' ? 'FAQs' : 'Useful Links'}
                    <span className="badge" style={{ background: '#aaa', marginLeft: 6 }}>
                      {t === 'docs' ? docs.length : t === 'faqs' ? faqs.length : links.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : tab === 'docs' ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => openDocForm()}>
                    <i className="fa fa-plus" style={{ marginRight: 4 }} />Add Document
                  </button>
                </div>

                {showDocForm && (
                  <div className="alert alert-info" style={{ marginBottom: 16 }}>
                    {error && <div className="alert alert-danger" style={{ marginBottom: 8 }}>{error}</div>}
                    <form onSubmit={saveDoc}>
                      <div className="row">
                        <div className="col-sm-5">
                          <div className="form-group">
                            <label>Title <span className="text-danger">*</span></label>
                            <input className="form-control" value={docForm.title ?? ''}
                              onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))} />
                          </div>
                        </div>
                        <div className="col-sm-2">
                          <div className="form-group">
                            <label>Type</label>
                            <select className="form-control" value={docForm.documentType ?? ''}
                              onChange={e => setDocForm(f => ({ ...f, documentType: e.target.value }))}>
                              <option value="">—</option>
                              {DOC_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-3">
                          <div className="form-group">
                            <label>Filename (after upload)</label>
                            <input className="form-control" value={docForm.documentName ?? ''}
                              onChange={e => setDocForm(f => ({ ...f, documentName: e.target.value }))}
                              placeholder="uploaded-file.pdf" />
                          </div>
                        </div>
                        <div className="col-sm-2">
                          <div className="form-group">
                            <label>Status</label>
                            <select className="form-control" value={docForm.status ?? '1'}
                              onChange={e => setDocForm(f => ({ ...f, status: e.target.value }))}>
                              <option value="1">Active</option>
                              <option value="0">Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                          {saving ? <i className="fa fa-spinner fa-spin" /> : 'Save'}
                        </button>
                        <button type="button" className="btn btn-white btn-sm"
                          onClick={() => setShowDocForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr><th>Title</th><th>Type</th><th>Filename</th><th>Status</th><th>Added</th><th></th></tr>
                    </thead>
                    <tbody>
                      {docs.map(d => (
                        <tr key={d.id}>
                          <td><strong>{d.title}</strong></td>
                          <td>{d.documentType ? <span className="label label-default">{d.documentType.toUpperCase()}</span> : '—'}</td>
                          <td style={{ fontSize: 12, color: '#888' }}>{d.documentName ?? '—'}</td>
                          <td>
                            <span className={`label label-${d.status === '1' ? 'success' : 'default'}`}>
                              {d.status === '1' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ fontSize: 12 }}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <button className="btn btn-xs btn-default" style={{ marginRight: 4 }} onClick={() => openDocForm(d)}>
                              <i className="fa fa-pencil" />
                            </button>
                            <button className="btn btn-xs btn-danger" onClick={() => deleteDoc(d.id)}>
                              <i className="fa fa-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : tab === 'faqs' ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => openFaqForm()}>
                    <i className="fa fa-plus" style={{ marginRight: 4 }} />Add FAQ
                  </button>
                </div>

                {showFaqForm && (
                  <div className="alert alert-info" style={{ marginBottom: 16 }}>
                    {error && <div className="alert alert-danger" style={{ marginBottom: 8 }}>{error}</div>}
                    <form onSubmit={saveFaq}>
                      <div className="form-group">
                        <label>Question <span className="text-danger">*</span></label>
                        <input className="form-control" value={faqForm.question ?? ''}
                          onChange={e => setFaqForm(f => ({ ...f, question: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Answer <span className="text-danger">*</span></label>
                        <textarea className="form-control" rows={4} value={faqForm.answer ?? ''}
                          onChange={e => setFaqForm(f => ({ ...f, answer: e.target.value }))} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label>Status</label>
                        <select className="form-control" value={faqForm.status ?? '1'}
                          onChange={e => setFaqForm(f => ({ ...f, status: e.target.value }))}>
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                          {saving ? <i className="fa fa-spinner fa-spin" /> : 'Save'}
                        </button>
                        <button type="button" className="btn btn-white btn-sm" onClick={() => setShowFaqForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr><th>#</th><th>Question</th><th>Answer</th><th>Status</th><th></th></tr>
                    </thead>
                    <tbody>
                      {faqs.map((f, i) => (
                        <tr key={f.id}>
                          <td style={{ color: '#888', width: 40 }}>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{f.question}</td>
                          <td style={{ fontSize: 13, color: '#666', maxWidth: 400 }}>
                            {f.answer.slice(0, 120)}{f.answer.length > 120 ? '…' : ''}
                          </td>
                          <td>
                            <span className={`label label-${f.status === '1' ? 'success' : 'default'}`}>
                              {f.status === '1' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <button className="btn btn-xs btn-default" style={{ marginRight: 4 }} onClick={() => openFaqForm(f)}>
                              <i className="fa fa-pencil" />
                            </button>
                            <button className="btn btn-xs btn-danger" onClick={() => deleteFaq(f.id)}>
                              <i className="fa fa-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => openLinkForm()}>
                    <i className="fa fa-plus" style={{ marginRight: 4 }} />Add Link
                  </button>
                </div>

                {showLinkForm && (
                  <div className="alert alert-info" style={{ marginBottom: 16 }}>
                    {error && <div className="alert alert-danger" style={{ marginBottom: 8 }}>{error}</div>}
                    <form onSubmit={saveLink}>
                      <div className="row">
                        <div className="col-sm-4">
                          <div className="form-group">
                            <label>Title <span className="text-danger">*</span></label>
                            <input className="form-control" value={linkForm.title ?? ''}
                              onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} />
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="form-group">
                            <label>URL <span className="text-danger">*</span></label>
                            <input className="form-control" type="url" value={linkForm.link ?? ''}
                              onChange={e => setLinkForm(f => ({ ...f, link: e.target.value }))}
                              placeholder="https://..." />
                          </div>
                        </div>
                        <div className="col-sm-2">
                          <div className="form-group">
                            <label>Link Type</label>
                            <select className="form-control" value={linkForm.linkType ?? ''}
                              onChange={e => setLinkForm(f => ({ ...f, linkType: e.target.value }))}>
                              <option value="">—</option>
                              {LINK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-2">
                          <div className="form-group">
                            <label>Status</label>
                            <select className="form-control" value={linkForm.status ?? '1'}
                              onChange={e => setLinkForm(f => ({ ...f, status: e.target.value }))}>
                              <option value="1">Active</option>
                              <option value="0">Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                          {saving ? <i className="fa fa-spinner fa-spin" /> : 'Save'}
                        </button>
                        <button type="button" className="btn btn-white btn-sm" onClick={() => setShowLinkForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr><th>Title</th><th>URL</th><th>Type</th><th>Status</th><th></th></tr>
                    </thead>
                    <tbody>
                      {links.map(l => (
                        <tr key={l.id}>
                          <td><strong>{l.title}</strong></td>
                          <td style={{ fontSize: 12 }}>
                            <a href={l.link} target="_blank" rel="noreferrer"
                              style={{ color: '#1c84c6', maxWidth: 280, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>
                              {l.link}
                            </a>
                          </td>
                          <td style={{ textTransform: 'capitalize', fontSize: 12 }}>{l.linkType ?? '—'}</td>
                          <td>
                            <span className={`label label-${l.status === '1' ? 'success' : 'default'}`}>
                              {l.status === '1' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <button className="btn btn-xs btn-default" style={{ marginRight: 4 }} onClick={() => openLinkForm(l)}>
                              <i className="fa fa-pencil" />
                            </button>
                            <button className="btn btn-xs btn-danger" onClick={() => deleteLink(l.id)}>
                              <i className="fa fa-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
