'use client';
/**
 * /admin/miscellaneous/emailTemplate — Email Template manager.
 *
 * Matches the legacy admin screen
 * (http://heronewlanding.local.com/admin/mis/template/email): a paged + searchable
 * data-table with Add/Edit/Delete actions and inline status badges.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Template {
  id: number;
  name?: string;
  alias?: string;
  subject?: string;
  message?: string;
  status?: '0' | '1';
  isDeleted?: '0' | '1';
  createdAt?: string;
  modifiedAt?: string;
}

type View = 'list' | 'add' | 'edit';

const BLANK: Partial<Template> = {
  name: '', alias: '', subject: '', message: '', status: '1',
};

export default function EmailTemplateAdminPage() {
  const [rows, setRows] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [form, setForm] = useState<Partial<Template>>(BLANK);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Table state
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Template[]>('/email-templates');
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter + paginate
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.name ?? '').toLowerCase().includes(q) ||
      (r.subject ?? '').toLowerCase().includes(q) ||
      (r.alias ?? '').toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => { setPage(1); }, [search, pageSize]);

  // Actions

  function openAdd() { setForm({ ...BLANK }); setMsg(null); setView('add'); }
  function openEdit(r: Template) { setForm({ ...r }); setMsg(null); setView('edit'); }

  async function save() {
    if (!form.name || !form.subject) {
      setMsg({ type: 'danger', text: 'Name and Subject are required' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      if (view === 'add') {
        await apiFetch('/email-templates', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      } else if (form.id) {
        await apiFetch(`/email-templates/${form.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      }
      setMsg({ type: 'success', text: 'Saved successfully' });
      setView('list');
      load();
    } catch (e: any) {
      setMsg({ type: 'danger', text: e?.message ?? 'Save failed' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(r: Template) {
    if (!confirm(`Delete email template "${r.name}"?`)) return;
    try {
      await apiFetch(`/email-templates/${r.id}`, { method: 'DELETE' });
      load();
    } catch (e: any) {
      alert(e?.message ?? 'Delete failed');
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      {/* Page heading + breadcrumb */}
      <div className="row">
        <div className="col-lg-9">
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Email Template</h2>
          <ol className="breadcrumb" style={{ background: 'transparent', padding: 0, marginBottom: 16 }}>
            <li><Link href="/admin" style={{ color: '#1c84c6' }}>Home</Link></li>
            <li style={{ marginLeft: 6 }}>/ Email Template</li>
          </ol>
        </div>
        {view === 'list' && (
          <div className="col-lg-3 text-right" style={{ textAlign: 'right' }}>
            <button onClick={openAdd} style={btnPrimary}>
              <i className="fa fa-plus" style={{ marginRight: 6 }} />
              Add Email Template
            </button>
          </div>
        )}
      </div>

      {view === 'list' && (
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>Template Data</h5>
              </div>
              <div className="ibox-content">
                {/* Top control bar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <button style={btnInfo} onClick={() => { setSearch(''); load(); }}>Reset</button>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8,
                }}>
                  <div style={{ fontSize: 13 }}>
                    Show{' '}
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(+e.target.value)}
                      style={selectStyle}
                    >
                      {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>{' '}
                    entries
                  </div>
                  <div style={{ fontSize: 13 }}>
                    Search:{' '}
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={inputSearch}
                    />
                  </div>
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <i className="fa fa-spinner fa-spin" style={{ fontSize: 22 }} />
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover" style={{ marginBottom: 0 }}>
                        <thead>
                          <tr style={{ background: '#f5f5f5' }}>
                            <th style={th}>Id</th>
                            <th style={th}>Subject</th>
                            <th style={th}>Name</th>
                            <th style={th}>Alias</th>
                            <th style={th}>Status</th>
                            <th style={{ ...th, width: 160 }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageRows.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>
                              No templates found.
                            </td></tr>
                          ) : (
                            pageRows.map(r => (
                              <tr key={r.id}>
                                <td style={td}>{r.id}</td>
                                <td style={{ ...td, color: '#e2231a' }}>{r.subject}</td>
                                <td style={{ ...td, color: '#e2231a' }}>{r.name}</td>
                                <td style={{ ...td, color: '#e2231a', fontFamily: 'monospace', fontSize: 12 }}>
                                  {r.alias}
                                </td>
                                <td style={td}>
                                  {r.status === '1'
                                    ? <span style={badge('#1ab394')}>Enable</span>
                                    : <span style={badge('#ed5565')}>Disable</span>}
                                </td>
                                <td style={td}>
                                  <button style={{ ...btnSmall('#ed5565'), marginRight: 6 }} onClick={() => remove(r)}>
                                    <i className="fa fa-times" style={{ marginRight: 4 }} />Delete
                                  </button>
                                  <button style={btnSmall('#1c84c6')} onClick={() => openEdit(r)}>
                                    <i className="fa fa-pencil" style={{ marginRight: 4 }} />Edit
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginTop: 12, fontSize: 13,
                    }}>
                      <span style={{ color: '#888' }}>
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          style={btnPager(page === 1)}
                        >
                          Previous
                        </button>
                        <span style={{ ...btnPager(false), background: '#e2231a', color: '#fff' }}>
                          {page}
                        </span>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          style={btnPager(page === totalPages)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {(view === 'add' || view === 'edit') && (
        <div className="row">
          <div className="col-lg-10">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>{view === 'add' ? 'Add Email Template' : 'Edit Email Template'}</h5>
              </div>
              <div className="ibox-content">
                {msg && (
                  <div className={`alert alert-${msg.type}`} style={{
                    background: msg.type === 'success' ? '#e7f8ef' : '#fff3f3',
                    border: `1px solid ${msg.type === 'success' ? '#1ab394' : '#f5c6cb'}`,
                    color: msg.type === 'success' ? '#1ab394' : '#721c24',
                    borderRadius: 4, padding: '10px 14px', marginBottom: 16, fontSize: 13,
                  }}>
                    {msg.text}
                  </div>
                )}

                <Field label="Name *">
                  <input
                    style={input}
                    value={form.name ?? ''}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </Field>
                <Field label="Alias">
                  <input
                    style={input}
                    value={form.alias ?? ''}
                    onChange={(e) => setForm(f => ({ ...f, alias: e.target.value }))}
                    placeholder="auto-generated from name if left blank"
                  />
                </Field>
                <Field label="Subject *">
                  <input
                    style={input}
                    value={form.subject ?? ''}
                    onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                  />
                </Field>
                <Field label="Message">
                  <textarea
                    style={{ ...input, minHeight: 200, fontFamily: 'monospace', fontSize: 12 }}
                    value={form.message ?? ''}
                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  />
                </Field>
                <Field label="Status">
                  <select
                    style={input}
                    value={form.status ?? '1'}
                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value as '0' | '1' }))}
                  >
                    <option value="1">Enable</option>
                    <option value="0">Disable</option>
                  </select>
                </Field>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button style={btnPrimary} onClick={save} disabled={saving}>
                    {saving
                      ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Saving…</>
                      : <><i className="fa fa-save" style={{ marginRight: 6 }} />Save</>}
                  </button>
                  <button style={btnSecondary} onClick={() => setView('list')}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 14 }}>
      <label style={{ width: 130, fontSize: 13, fontWeight: 600, color: '#555', paddingTop: 8 }}>{label}</label>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const th: React.CSSProperties = { padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#555' };
const td: React.CSSProperties = { padding: '10px 16px', verticalAlign: 'middle', fontSize: 13 };
const input: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc',
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
};
const inputSearch: React.CSSProperties = {
  ...input, width: 200, display: 'inline-block', marginLeft: 6,
};
const selectStyle: React.CSSProperties = {
  padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13,
};
const btnPrimary: React.CSSProperties = {
  background: '#1ab394', color: '#fff', border: 'none', borderRadius: 4,
  padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const btnSecondary: React.CSSProperties = {
  background: '#fff', color: '#676a6c', border: '1px solid #e7eaec', borderRadius: 4,
  padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const btnInfo: React.CSSProperties = {
  background: '#1ab394', color: '#fff', border: 'none', borderRadius: 4,
  padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
};
function btnSmall(color: string): React.CSSProperties {
  return {
    background: color, color: '#fff', border: 'none', borderRadius: 3,
    padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center',
  };
}
function btnPager(disabled: boolean): React.CSSProperties {
  return {
    background: '#fff', color: disabled ? '#bbb' : '#1c84c6',
    border: '1px solid #e7eaec', borderRadius: 3,
    padding: '5px 12px', fontSize: 12, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
function badge(bg: string): React.CSSProperties {
  return {
    background: bg, color: '#fff', borderRadius: 10,
    padding: '2px 10px', fontSize: 11, fontWeight: 700,
    display: 'inline-block',
  };
}
