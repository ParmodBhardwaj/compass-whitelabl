'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface KaizenItem {
  id: number;
  kaizenNo?: string;
  idea?: string;
  problemDefinition?: string;
  type?: string;
  category?: string;
  savingType?: string;
  annualBenefits?: number;
  investment?: number;
  currentStatus?: string;
  draft?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: number;
  createdAt?: string;
  imageBefore?: string;
}

interface Stats {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
}

interface Pillar { id: number; name: string; }

type TabFilter = 'my' | 'all' | 'approved';

const STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  submitted: 'warning',
  under_review: 'info',
  pillar_review: 'info',
  plant_review: 'info',
  approved: 'success',
  rejected: 'danger',
  revision: 'primary',
};

export default function KaizenListPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [rows, setRows] = useState<KaizenItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [tab, setTab] = useState<TabFilter>('my');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pillarFilter, setPillarFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<{ id: number }>('/auth/me');
        setUserId(me.id);
        const [pillarList, myKaizens, myStats] = await Promise.all([
          apiFetch<Pillar[]>('/kaizen/meta/pillars'),
          apiFetch<KaizenItem[]>(`/kaizen?userId=${me.id}`),
          apiFetch<Stats>(`/kaizen/stats?userId=${me.id}`),
        ]);
        setPillars(Array.isArray(pillarList) ? pillarList : []);
        setRows(Array.isArray(myKaizens) ? myKaizens : []);
        setStats(myStats);
      } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (userId === null) return;
    setLoading(true);
    let url = `/kaizen?userId=${userId}`;
    if (tab === 'all') url = '/kaizen?all=1';
    else if (tab === 'approved') url = '/kaizen?all=1&status=approved';
    apiFetch<KaizenItem[]>(url)
      .then(d => setRows(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, userId]);

  const filtered = useMemo(() => {
    let list = rows;
    if (pillarFilter) list = list.filter(r => String((r as any).pillarId) === pillarFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.kaizenNo ?? '').toLowerCase().includes(q) ||
        (r.idea ?? '').toLowerCase().includes(q) ||
        (r.problemDefinition ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, search, pillarFilter]);

  const displayStatus = (k: KaizenItem) => k.draft === '1' ? 'draft' : (k.currentStatus ?? 'submitted');

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Kaizen</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Kaizen</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Link href="/portal/kaizen/new" className="btn btn-primary btn-sm">
            <i className="fa fa-plus" style={{ marginRight: 4 }} />New Kaizen
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>

        {/* Stats */}
        {stats && (
          <div className="row" style={{ marginBottom: 16 }}>
            {[
              { label: 'Total', value: stats.total, cls: 'navy-bg' },
              { label: 'Submitted', value: stats.submitted, cls: 'lazur-bg' },
              { label: 'Approved', value: stats.approved, cls: 'green-bg' },
              { label: 'Rejected', value: stats.rejected, cls: 'red-bg' },
            ].map(tile => (
              <div key={tile.label} className="col-lg-3 col-md-6">
                <div className={`widget style1 ${tile.cls}`} style={{ borderRadius: 4, marginBottom: 8 }}>
                  <div className="row">
                    <div className="col-xs-4" style={{ padding: '10px 0 10px 20px' }}>
                      <i className="fa fa-lightbulb-o fa-3x" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </div>
                    <div className="col-xs-8" style={{ padding: '10px 20px 10px 0', textAlign: 'right' }}>
                      <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', display: 'block' }}>{tile.value}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{tile.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ margin: 0 }}>Kaizen Ideas</h5>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-control input-sm" style={{ width: 160 }} value={pillarFilter}
                onChange={e => setPillarFilter(e.target.value)}>
                <option value="">All Pillars</option>
                {pillars.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </select>
              <input className="form-control input-sm" style={{ width: 200 }} placeholder="Search..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="ibox-content">
            <ul className="nav nav-tabs" style={{ marginBottom: 16 }}>
              {([['my', 'My Kaizens'], ['all', 'All'], ['approved', 'Approved']] as [TabFilter, string][]).map(([t, label]) => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}>{label}</a>
                </li>
              ))}
            </ul>

            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted" style={{ padding: 30 }}>No kaizen ideas found.</p>
            ) : (
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>Kaizen No.</th>
                    <th>Idea / Problem</th>
                    <th style={{ width: 90 }}>Type</th>
                    <th style={{ width: 90 }}>Saving</th>
                    <th style={{ width: 100 }}>Annual Benefit</th>
                    <th style={{ width: 110, textAlign: 'center' }}>Status</th>
                    <th style={{ width: 80 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(k => {
                    const st = displayStatus(k);
                    const stCls = STATUS_COLOR[st] ?? 'default';
                    return (
                      <tr key={k.id}>
                        <td style={{ verticalAlign: 'middle' }}>
                          {k.kaizenNo ? <code>{k.kaizenNo}</code> : <span className="text-muted">#{k.id}</span>}
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <Link href={`/portal/kaizen/${k.id}`} style={{ fontWeight: 600 }}>
                            {(k.idea ?? k.problemDefinition ?? '').slice(0, 80)}
                            {((k.idea ?? k.problemDefinition ?? '').length > 80) ? '…' : ''}
                          </Link>
                        </td>
                        <td style={{ verticalAlign: 'middle', textTransform: 'capitalize' }}>{k.type ?? '—'}</td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <span className="label label-default" style={{ textTransform: 'capitalize' }}>{k.savingType ?? '—'}</span>
                        </td>
                        <td style={{ verticalAlign: 'middle', fontWeight: 600 }}>
                          {k.annualBenefits ? `₹${Number(k.annualBenefits).toLocaleString()}` : '—'}
                        </td>
                        <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                          <span className={`label label-${stCls}`} style={{ textTransform: 'capitalize' }}>
                            {st.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <Link href={`/portal/kaizen/${k.id}`} className="btn btn-xs btn-primary">
                            <i className="fa fa-eye" style={{ marginRight: 3 }} />View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
