'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface AuditItem {
  id: number;
  uniqueNumber?: string;
  name?: string;
  functionAudit?: string;
  financialYear?: string;
  status?: string;
  createdOn?: string;
}

type StatusFilter = 'open' | 'closed';

const STATUS_BADGE: Record<string, string> = {
  open: 'primary',
  closed: 'success',
  default: 'default',
};

export default function AuditListPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [rows, setRows] = useState<AuditItem[]>([]);
  const [tab, setTab] = useState<StatusFilter>('open');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Get current user's ID first
  useEffect(() => {
    apiFetch<{ id: number; email: string; name?: string }>('/auth/me')
      .then(u => setUserId(u.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (userId === null) return;
    setLoading(true);
    apiFetch<AuditItem[]>(`/audit?userId=${userId}&status=${tab}`)
      .then(data => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [userId, tab]);

  const filtered = rows.filter(r =>
    !search.trim() ||
    (r.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (r.uniqueNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (r.financialYear ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Audit Follow-Up</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Audit</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ margin: 0 }}>My Audits</h5>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ margin: 0, fontSize: 13 }}>Search:</label>
              <input
                className="form-control input-sm"
                style={{ width: 200 }}
                placeholder="Name / Unique No..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="ibox-content">
            {/* Tabs */}
            <ul className="nav nav-tabs" style={{ marginBottom: 16 }}>
              {(['open', 'closed'] as StatusFilter[]).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}>
                    {t === 'open' ? 'Open' : 'Closed'}
                  </a>
                </li>
              ))}
            </ul>

            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted" style={{ padding: 30 }}>No audits found.</p>
            ) : (
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th style={{ width: 130 }}>Unique No.</th>
                    <th>Audit Name</th>
                    <th style={{ width: 160 }}>Function / Dept</th>
                    <th style={{ width: 110 }}>Financial Year</th>
                    <th style={{ width: 100, textAlign: 'center' }}>Status</th>
                    <th style={{ width: 80 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td style={{ verticalAlign: 'middle' }}>
                        <code>{r.uniqueNumber}</code>
                      </td>
                      <td style={{ verticalAlign: 'middle', fontWeight: 600 }}>
                        <Link href={`/portal/audit/${r.id}`}>{r.name}</Link>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>{r.functionAudit}</td>
                      <td style={{ verticalAlign: 'middle' }}>{r.financialYear}</td>
                      <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                        <span className={`label label-${STATUS_BADGE[r.status ?? ''] ?? STATUS_BADGE.default}`}>
                          {r.status ?? '—'}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <Link href={`/portal/audit/${r.id}`} className="btn btn-xs btn-primary">
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
