'use client';
/**
 * /admin/activityReport — SOP Activity Tracker report.
 * Aggregates `sop_activity_tracker` joined with employee for an admin
 * audit trail of who did what when across the SOP workflow.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Row {
  id: number;
  userId?: number;
  ecode?: string;
  name?: string;
  email?: string;
  activityDescription?: string;
  activityDate?: string;
  createdAt?: string;
}

export default function SopActivityReportPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to, limit: '500' });
      const data = await apiFetch<Row[]>(`/sop/activity-report?${params}`);
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
      (r.activityDescription ?? '').toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pageRows = filtered.slice((page - 1) * PAGE, page * PAGE);
  useEffect(() => setPage(1), [search]);

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-12">
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>SOP — Activity Report</h2>
          <ol className="breadcrumb" style={{ background: 'transparent', padding: 0, marginBottom: 16 }}>
            <li><Link href="/admin" style={{ color: '#1c84c6' }}>Home</Link></li>
            <li style={{ marginLeft: 6 }}>/ SOP / Activity Report</li>
          </ol>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h5 style={{ margin: 0 }}>Audit Trail</h5>
              <span style={{ fontSize: 12, color: '#888' }}>{filtered.length} records</span>
            </div>
            <div className="ibox-content">
              <div style={{ display: 'flex', gap: 12, alignItems: 'end', marginBottom: 14, flexWrap: 'wrap' }}>
                <div>
                  <label style={lbl}>From</label>
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={input} />
                </div>
                <div>
                  <label style={lbl}>To</label>
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={input} />
                </div>
                <button style={btnPrimary} onClick={load}>
                  <i className="fa fa-refresh" style={{ marginRight: 5 }} />Refresh
                </button>
                <div style={{ marginLeft: 'auto' }}>
                  <label style={lbl}>Search</label>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="name / ecode / description" style={{ ...input, width: 240 }} />
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><i className="fa fa-spinner fa-spin" style={{ fontSize: 22 }} /></div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                          <th style={th}>#</th>
                          <th style={th}>Date</th>
                          <th style={th}>Ecode</th>
                          <th style={th}>User</th>
                          <th style={th}>Activity</th>
                          <th style={th}>Logged At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.length === 0 ? (
                          <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>
                            No activity in this date range.
                          </td></tr>
                        ) : pageRows.map((r, i) => (
                          <tr key={r.id}>
                            <td style={td}>{(page - 1) * PAGE + i + 1}</td>
                            <td style={td}>{r.activityDate ?? '—'}</td>
                            <td style={td}>{r.ecode ?? '—'}</td>
                            <td style={{ ...td, fontWeight: 600 }}>{r.name ?? `#${r.userId}`}</td>
                            <td style={{ ...td, fontSize: 12, color: '#555' }}>{r.activityDescription}</td>
                            <td style={{ ...td, fontSize: 11, color: '#aaa' }}>
                              {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 13 }}>
                      <span style={{ color: '#888' }}>
                        Showing {(page - 1) * PAGE + 1} to {Math.min(page * PAGE, filtered.length)} of {filtered.length}
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

const th: React.CSSProperties = { padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#555' };
const td: React.CSSProperties = { padding: '10px 14px', verticalAlign: 'middle', fontSize: 13 };
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4 };
const input: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13, outline: 'none',
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
