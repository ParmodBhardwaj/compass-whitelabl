'use client';
/**
 * /admin/login-usage — Login Activity Report (read-only).
 * Mirrors legacy `lmcadmin/login-usage`. Aggregates `hero_login_usage`
 * joined with `employee` so admins see who logged in, how many times,
 * and last login timestamp.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface UsageRow {
  userId?: number;
  ecode?: string;
  name?: string;
  email?: string;
  designation?: string;
  loginCount?: number;
  lastLogin?: string;
}

export default function LoginUsagePage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [rows, setRows] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to, limit: '500' });
      const data = await apiFetch<UsageRow[]>(`/login-usage?${params}`);
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.name ?? '').toLowerCase().includes(q) ||
      (r.ecode ?? '').toLowerCase().includes(q) ||
      (r.email ?? '').toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [search]);

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-12">
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Login Users Report</h2>
          <ol className="breadcrumb" style={{ background: 'transparent', padding: 0, marginBottom: 16 }}>
            <li><Link href="/admin" style={{ color: '#1c84c6' }}>Home</Link></li>
            <li style={{ marginLeft: 6 }}>/ Login Users Report</li>
          </ol>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h5 style={{ margin: 0 }}>Logins by Employee</h5>
              <span style={{ fontSize: 12, color: '#888' }}>{filtered.length} users</span>
            </div>
            <div className="ibox-content">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end', marginBottom: 14 }}>
                <div>
                  <label style={lbl}>From</label>
                  <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={input} />
                </div>
                <div>
                  <label style={lbl}>To</label>
                  <input type="date" value={to} onChange={e => setTo(e.target.value)} style={input} />
                </div>
                <button onClick={load} style={btnPrimary}>
                  <i className="fa fa-refresh" style={{ marginRight: 5 }} />Refresh
                </button>
                <div style={{ marginLeft: 'auto' }}>
                  <label style={lbl}>Search</label>
                  <input
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="name / ecode / email" style={{ ...input, width: 220 }}
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
                          <th style={th}>#</th>
                          <th style={th}>Ecode</th>
                          <th style={th}>Name</th>
                          <th style={th}>Email</th>
                          <th style={th}>Designation</th>
                          <th style={th}>Login Count</th>
                          <th style={th}>Last Login</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.length === 0 ? (
                          <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>
                            No logins in this date range.
                          </td></tr>
                        ) : pageRows.map((r, i) => (
                          <tr key={r.userId ?? i}>
                            <td style={td}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                            <td style={td}>{r.ecode ?? '—'}</td>
                            <td style={{ ...td, fontWeight: 600 }}>{r.name ?? '—'}</td>
                            <td style={{ ...td, fontSize: 12, color: '#777' }}>{r.email ?? ''}</td>
                            <td style={{ ...td, fontSize: 12, color: '#777' }}>{r.designation ?? ''}</td>
                            <td style={td}>
                              <span style={{
                                background: '#1c84c6', color: '#fff',
                                borderRadius: 10, padding: '2px 10px',
                                fontSize: 11, fontWeight: 700,
                              }}>
                                {r.loginCount ?? 0}
                              </span>
                            </td>
                            <td style={{ ...td, fontSize: 12, color: '#555' }}>
                              {r.lastLogin ? new Date(r.lastLogin).toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginTop: 12, fontSize: 13,
                    }}>
                      <span style={{ color: '#888' }}>
                        Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{' '}
                        {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={btnPager(page === 1)}>Previous</button>
                        <span style={{ ...btnPager(false), background: '#e2231a', color: '#fff' }}>{page}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={btnPager(page === totalPages)}>Next</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#555' };
const td: React.CSSProperties = { padding: '10px 16px', verticalAlign: 'middle', fontSize: 13 };
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4 };
const input: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc',
  fontSize: 13, outline: 'none',
};
const btnPrimary: React.CSSProperties = {
  background: '#1ab394', color: '#fff', border: 'none', borderRadius: 4,
  padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
function btnPager(disabled: boolean): React.CSSProperties {
  return {
    background: '#fff', color: disabled ? '#bbb' : '#1c84c6',
    border: '1px solid #e7eaec', borderRadius: 3,
    padding: '5px 12px', fontSize: 12, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
