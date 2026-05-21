'use client';
/**
 * /admin/process — SOP Processes (read-only summary view).
 * The full SOP workflow lives on the portal at /portal/sop. This page
 * is just the admin's birds-eye view: list every process with status
 * + section + revision number so admins can audit at a glance.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Proc {
  id: number;
  title?: string;
  alias?: string;
  sectionId?: number;
  status?: string;
  revisionNumber?: number;
  implementationDate?: string;
  isRevised?: 'New' | 'Revised';
  createdBy?: number;
}
interface Section { id: number; name?: string }

export default function SopProcessAdminPage() {
  const [rows, setRows] = useState<Proc[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<number | ''>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, secs] = await Promise.all([
        apiFetch<Proc[]>(`/sop/processes?limit=500${sectionFilter ? `&sectionId=${sectionFilter}` : ''}`),
        apiFetch<Section[]>('/sop/sections?type=ss%26sc'),
      ]);
      setRows(Array.isArray(data) ? data : []);
      setSections(Array.isArray(secs) ? secs : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }, [sectionFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      (r.title ?? '').toLowerCase().includes(q) ||
      (r.alias ?? '').toLowerCase().includes(q),
    );
  }, [rows, search]);

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-12">
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>SOP — Processes</h2>
          <ol className="breadcrumb" style={{ background: 'transparent', padding: 0, marginBottom: 16 }}>
            <li><Link href="/admin" style={{ color: '#1c84c6' }}>Home</Link></li>
            <li style={{ marginLeft: 6 }}>/ SOP / Processes</li>
          </ol>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <h5 style={{ margin: 0 }}>Processes ({filtered.length})</h5>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={String(sectionFilter)} onChange={e => setSectionFilter(e.target.value ? +e.target.value : '')} style={input}>
                  <option value="">All Departments</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="text" placeholder="Search title…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...input, width: 220 }} />
              </div>
            </div>
            <div className="ibox-content">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><i className="fa fa-spinner fa-spin" /></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={th}>Id</th>
                        <th style={th}>Title</th>
                        <th style={th}>Section</th>
                        <th style={th}>Rev #</th>
                        <th style={th}>Status</th>
                        <th style={th}>Impl. Date</th>
                        <th style={th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>No processes found.</td></tr>
                      ) : filtered.map(r => (
                        <tr key={r.id}>
                          <td style={td}>{r.id}</td>
                          <td style={{ ...td, fontWeight: 600 }}>
                            {r.title}
                            {r.isRevised === 'Revised' && <span style={{ marginLeft: 8, fontSize: 10, background: '#f8ac59', color: '#fff', borderRadius: 8, padding: '1px 7px' }}>REVISED</span>}
                          </td>
                          <td style={td}>{sections.find(s => s.id === r.sectionId)?.name ?? '—'}</td>
                          <td style={td}>{r.revisionNumber ?? 0}</td>
                          <td style={td}>
                            <span style={{
                              background: statusColor(r.status), color: '#fff',
                              borderRadius: 10, padding: '2px 10px',
                              fontSize: 10, fontWeight: 700,
                            }}>
                              {r.status ?? '—'}
                            </span>
                          </td>
                          <td style={td}>{r.implementationDate ?? '—'}</td>
                          <td style={td}>
                            <Link href={`/portal/sop/${r.id}`} style={{ color: '#1c84c6', fontSize: 12 }}>
                              <i className="fa fa-eye" style={{ marginRight: 4 }} />View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusColor(s?: string): string {
  if (!s) return '#95a5a6';
  if (s.includes('Reject')) return '#ed5565';
  if (s === '1' || s.includes('SS&SC Head Approved')) return '#1ab394';
  if (s.includes('Approved')) return '#1c84c6';
  return '#f8ac59';
}

const th: React.CSSProperties = { padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#555' };
const td: React.CSSProperties = { padding: '10px 14px', verticalAlign: 'middle', fontSize: 13 };
const input: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13, outline: 'none',
};
