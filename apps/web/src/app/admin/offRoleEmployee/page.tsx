'use client';
/**
 * /admin/offRoleEmployee — Off-role employees report.
 * Read-only view of `employee_dtl_all_plants` (the legacy CSV-imported
 * sheet of non-roll employees across all plants).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface OffRole {
  id: number;
  LOCATION?: string;
  OLD_EC_NO?: string;
  EC_NO?: string;
  NAME?: string;
  AGE?: number;
  GENDER?: string;
  SECTION?: string;
  DEPARTMENT?: string;
  CATEGORY?: string;
  STATUS?: string;
}

export default function OffRoleEmployeePage() {
  const [rows, setRows] = useState<OffRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<OffRole[]>('/off-role-employees?limit=1000');
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.NAME ?? '').toLowerCase().includes(q) ||
      (r.EC_NO ?? '').toLowerCase().includes(q) ||
      (r.OLD_EC_NO ?? '').toLowerCase().includes(q) ||
      (r.DEPARTMENT ?? '').toLowerCase().includes(q) ||
      (r.SECTION ?? '').toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pageRows = filtered.slice((page - 1) * PAGE, page * PAGE);
  useEffect(() => setPage(1), [search]);

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-12">
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Off Role Employees</h2>
          <ol className="breadcrumb" style={{ background: 'transparent', padding: 0, marginBottom: 16 }}>
            <li><Link href="/admin" style={{ color: '#1c84c6' }}>Home</Link></li>
            <li style={{ marginLeft: 6 }}>/ Off Role Employees</li>
          </ol>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0 }}>Off-Role Employees Data ({filtered.length})</h5>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, code, dept…"
                style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13, width: 260 }}
              />
            </div>
            <div className="ibox-content">
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
                          <th style={th}>EC No</th>
                          <th style={th}>Old EC No</th>
                          <th style={th}>Name</th>
                          <th style={th}>Location</th>
                          <th style={th}>Department</th>
                          <th style={th}>Section</th>
                          <th style={th}>Category</th>
                          <th style={th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.length === 0 ? (
                          <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>
                            No off-role employees found.
                          </td></tr>
                        ) : pageRows.map((r, i) => (
                          <tr key={r.id}>
                            <td style={td}>{(page - 1) * PAGE + i + 1}</td>
                            <td style={td}>{r.EC_NO ?? '—'}</td>
                            <td style={td}>{r.OLD_EC_NO ?? '—'}</td>
                            <td style={{ ...td, fontWeight: 600 }}>{r.NAME}</td>
                            <td style={td}>{r.LOCATION ?? '—'}</td>
                            <td style={td}>{r.DEPARTMENT ?? '—'}</td>
                            <td style={td}>{r.SECTION ?? '—'}</td>
                            <td style={td}>{r.CATEGORY ?? '—'}</td>
                            <td style={td}>{r.STATUS ?? '—'}</td>
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
function btnPager(disabled: boolean): React.CSSProperties {
  return {
    background: '#fff', color: disabled ? '#bbb' : '#1c84c6',
    border: '1px solid #e7eaec', borderRadius: 3,
    padding: '5px 12px', fontSize: 12, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
