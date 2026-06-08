'use client';
/**
 * Reusable CRUD admin panel used by master-data screens (Department,
 * Location, Setting, etc.). Caller declares:
 *
 *   • `title`        — page heading (e.g. "Departments")
 *   • `breadcrumb`   — trail under the heading
 *   • `apiPath`      — REST resource base (e.g. "/departments")
 *   • `columns`      — table columns + how to read each from a row
 *   • `fields`       — form fields for Add/Edit
 *   • `rowKey`       — function that picks the row PK (defaults to .id)
 *   • `blank`        — initial form values
 *
 * The component handles list / search / paginate / add / edit / delete with
 * a consistent Inspinia-styled UI matching the legacy admin look.
 */
import { useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';
import { FileUpload } from '@/components/admin/FileUpload';
import { resolveImage } from '@/lib/legacy-url';

export interface MDColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  width?: string | number;
}

export interface MDField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'image';
  required?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  /** For image fields — subfolder under /files/ for preview rendering. */
  imageFolder?: string;
}

interface Props<T extends Record<string, any>> {
  title: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  apiPath: string;
  columns: MDColumn<T>[];
  fields: MDField[];
  blank: Partial<T>;
  rowKey?: (row: T) => string | number;
  searchableKeys?: Array<keyof T>;
  /** Tweak the human label for the entity in toasts. Defaults to title. */
  entityName?: string;
}

type View = 'list' | 'add' | 'edit';

export function MasterDataPanel<T extends Record<string, any>>(props: Props<T>) {
  const {
    title, breadcrumb, apiPath, columns, fields, blank,
    rowKey = (r) => r.id ?? 0, searchableKeys, entityName,
  } = props;
  const noun = entityName ?? title.replace(/s$/, '');

  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [form, setForm] = useState<Partial<T>>({ ...blank });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<T[]>(apiPath);
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [apiPath]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    const keys = (searchableKeys ?? Object.keys(blank)) as Array<keyof T>;
    return rows.filter((r) =>
      keys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)),
    );
  }, [rows, search, searchableKeys, blank]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => { setPage(1); }, [search, pageSize]);

  function openAdd() { setForm({ ...blank }); setMsg(null); setView('add'); }
  function openEdit(r: T) { setForm({ ...r }); setMsg(null); setView('edit'); }

  async function save() {
    // Required-field check.
    const missing = fields.filter(f => f.required && !String(form[f.name as keyof T] ?? '').trim());
    if (missing.length) {
      setMsg({ type: 'danger', text: `Required: ${missing.map(m => m.label).join(', ')}` });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const id = (form as any).id;
      // Split `apiPath` so the query string (if any) survives mutating verbs.
      // GET still uses the full path so list-scoped filters like `?type=visitor`
      // continue to work; POST/PUT/DELETE drop the query string but keep the
      // path segment.
      const [base] = apiPath.split('?');
      if (view === 'add') {
        await apiFetch(base, { method: 'POST', body: JSON.stringify(form) });
      } else if (id != null) {
        await apiFetch(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(form) });
      }
      setMsg({ type: 'success', text: `${noun} saved successfully` });
      setView('list');
      load();
    } catch (e: any) {
      setMsg({ type: 'danger', text: e?.message ?? 'Save failed' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(r: T) {
    const id = rowKey(r);
    if (!confirm(`Delete this ${noun.toLowerCase()}?`)) return;
    try {
      const [base] = apiPath.split('?');
      await apiFetch(`${base}/${id}`, { method: 'DELETE' });
      load();
    } catch (e: any) {
      alert(e?.message ?? 'Delete failed');
    }
  }

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-9">
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h2>
          {breadcrumb && (
            <ol className="breadcrumb" style={{ background: 'transparent', padding: 0, marginBottom: 16 }}>
              {breadcrumb.map((b, i) => (
                <li key={i} style={{ marginLeft: i > 0 ? 6 : 0 }}>
                  {b.href ? <Link href={b.href} style={{ color: '#1c84c6' }}>{b.label}</Link> : <>/ {b.label}</>}
                </li>
              ))}
            </ol>
          )}
        </div>
        {view === 'list' && (
          <div className="col-lg-3" style={{ textAlign: 'right' }}>
            <button style={btnPrimary} onClick={openAdd}>
              <i className="fa fa-plus" style={{ marginRight: 6 }} />Add {noun}
            </button>
          </div>
        )}
      </div>

      {view === 'list' && (
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>{title} Data</h5>
              </div>
              <div className="ibox-content">
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8,
                }}>
                  <div style={{ fontSize: 13 }}>
                    Show{' '}
                    <select value={pageSize} onChange={(e) => setPageSize(+e.target.value)} style={selectStyle}>
                      {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>{' '}entries
                  </div>
                  <div style={{ fontSize: 13 }}>
                    Search:{' '}
                    <input
                      type="text" value={search}
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
                            {columns.map((c, i) => (
                              <th key={i} style={{ ...th, width: c.width as any }}>{c.header}</th>
                            ))}
                            <th style={{ ...th, width: 160 }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageRows.length === 0 ? (
                            <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>
                              No {noun.toLowerCase()}s found.
                            </td></tr>
                          ) : pageRows.map(r => (
                            <tr key={rowKey(r)}>
                              {columns.map((c, i) => <td key={i} style={td}>{c.cell(r)}</td>)}
                              <td style={td}>
                                <button style={{ ...btnSmall('#ed5565'), marginRight: 6 }} onClick={() => remove(r)}>
                                  <i className="fa fa-times" style={{ marginRight: 4 }} />Delete
                                </button>
                                <button style={btnSmall('#1c84c6')} onClick={() => openEdit(r)}>
                                  <i className="fa fa-pencil" style={{ marginRight: 4 }} />Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginTop: 12, fontSize: 13,
                    }}>
                      <span style={{ color: '#888' }}>
                        Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
                        {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={btnPager(page === 1)}>Previous</button>
                        <span style={{ ...btnPager(false), background: '#e2231a', color: '#fff' }}>{page}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={btnPager(page === totalPages)}>Next</button>
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
                <h5 style={{ margin: 0 }}>{view === 'add' ? `Add ${noun}` : `Edit ${noun}`}</h5>
              </div>
              <div className="ibox-content">
                {msg && (
                  <div style={{
                    background: msg.type === 'success' ? '#e7f8ef' : '#fff3f3',
                    border: `1px solid ${msg.type === 'success' ? '#1ab394' : '#f5c6cb'}`,
                    color: msg.type === 'success' ? '#1ab394' : '#721c24',
                    borderRadius: 4, padding: '10px 14px', marginBottom: 16, fontSize: 13,
                  }}>{msg.text}</div>
                )}

                {fields.map(f => (
                  <div key={f.name} className="form-group" style={{
                    display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 14,
                  }}>
                    <label style={{ width: 140, fontSize: 13, fontWeight: 600, color: '#555', paddingTop: 8 }}>
                      {f.label}{f.required && ' *'}
                    </label>
                    <div style={{ flex: 1 }}>
                      {f.type === 'image' ? (
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          {(() => {
                            const val = String((form as any)[f.name] ?? '');
                            if (!val) return (
                              <div style={{
                                width: 80, height: 80, borderRadius: 6,
                                background: '#f4f4f4', border: '1px dashed #ccc',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#aaa',
                              }}>
                                <i className="fa fa-image" style={{ fontSize: 24 }} />
                              </div>
                            );
                            const src = val.startsWith('http') || val.startsWith('/')
                              ? val
                              : resolveImage(val, f.imageFolder ?? 'images') ?? `/files/images/${val}`;
                            return (
                              <img src={src} alt=""
                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e5e5' }}
                                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                              />
                            );
                          })()}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <FileUpload
                              onUploaded={(results) => {
                                const r = results[0];
                                if (r) setForm(s => ({ ...s, [f.name]: r.filename ?? r.url }));
                              }}
                            />
                            <input
                              type="text"
                              style={{ ...inputForm, padding: '6px 10px', fontSize: 12 }}
                              value={String((form as any)[f.name] ?? '')}
                              onChange={(e) => setForm(s => ({ ...s, [f.name]: e.target.value }))}
                              placeholder="…or paste filename"
                            />
                          </div>
                        </div>
                      ) : f.type === 'textarea' ? (
                        <textarea
                          style={{ ...inputForm, minHeight: 120 }}
                          value={String((form as any)[f.name] ?? '')}
                          onChange={(e) => setForm(s => ({ ...s, [f.name]: e.target.value }))}
                          placeholder={f.placeholder}
                        />
                      ) : f.type === 'select' ? (
                        <select
                          style={inputForm}
                          value={String((form as any)[f.name] ?? '')}
                          onChange={(e) => setForm(s => ({ ...s, [f.name]: e.target.value }))}
                        >
                          <option value="">— select —</option>
                          {(f.options ?? []).map(o => (
                            <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type === 'number' ? 'number' : 'text'}
                          style={inputForm}
                          value={String((form as any)[f.name] ?? '')}
                          onChange={(e) => setForm(s => ({
                            ...s,
                            [f.name]: f.type === 'number' ? (e.target.value === '' ? '' : +e.target.value) : e.target.value,
                          }))}
                          placeholder={f.placeholder}
                        />
                      )}
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button style={btnPrimary} onClick={save} disabled={saving}>
                    {saving ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Saving…</>
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

const th: React.CSSProperties = { padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#555' };
const td: React.CSSProperties = { padding: '10px 16px', verticalAlign: 'middle', fontSize: 13 };
const inputForm: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc',
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
};
const inputSearch: React.CSSProperties = { ...inputForm, width: 200, display: 'inline-block', marginLeft: 6 };
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
