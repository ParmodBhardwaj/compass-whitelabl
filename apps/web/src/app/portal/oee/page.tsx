'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface OeeRequest {
  id: number;
  requestDate: string;
  shift?: string;
  lineId?: number;
  machineId?: number;
  oee?: string;
  availabilityRate?: string;
  performanceRate?: string;
  qualityRate?: string;
  netProduction?: string;
  productionPlan?: string;
  productionActual?: string;
  status?: string;
  createdBy?: number;
}

interface OeeLine {
  id: number;
  name?: string;
  lineName?: string;
}

interface OeeSection {
  id: number;
  name?: string;
  sectionName?: string;
}

const SHIFT_COLORS: Record<string, string> = { A: 'primary', B: 'warning', C: 'danger', G: 'success' };

function oeeColor(pct: number) {
  if (pct >= 85) return '#1ab394';
  if (pct >= 65) return '#f8ac59';
  return '#ed5565';
}

export default function OeePage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [requests, setRequests] = useState<OeeRequest[]>([]);
  const [sections, setSections] = useState<OeeSection[]>([]);
  const [lines, setLines] = useState<OeeLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'my' | 'all'>('my');

  // Filters
  const [filters, setFilters] = useState({ sectionId: '', lineId: '', from: '', to: '' });

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<{ id: number }>('/auth/me');
        setUserId(me.id);
        const secs = await apiFetch<OeeSection[]>('/oee/sections');
        setSections(secs);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadRequests();
  }, [userId, tab, filters]);

  async function loadRequests() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab === 'my' && userId) params.set('createdBy', String(userId));
      else params.set('all', '1');
      if (filters.sectionId) params.set('sectionId', filters.sectionId);
      if (filters.lineId) params.set('lineId', filters.lineId);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      const data = await apiFetch<OeeRequest[]>(`/oee/requests?${params}`);
      setRequests(data);
    } catch {}
    setLoading(false);
  }

  async function loadLines(sectionId: string) {
    setFilters(f => ({ ...f, sectionId, lineId: '' }));
    if (sectionId) {
      const data = await apiFetch<OeeLine[]>(`/oee/lines?sectionId=${sectionId}`);
      setLines(data);
    } else {
      setLines([]);
    }
  }

  // Stats
  const avgOee = requests.length
    ? requests.reduce((s, r) => s + parseFloat(r.oee ?? '0'), 0) / requests.length
    : 0;
  const highCount = requests.filter(r => parseFloat(r.oee ?? '0') >= 85).length;
  const lowCount = requests.filter(r => parseFloat(r.oee ?? '0') < 65).length;

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>OEE Dashboard</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>OEE</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Link href="/portal/oee/log" className="btn btn-primary btn-sm">
            <i className="fa fa-plus" style={{ marginRight: 4 }} />Log OEE
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Summary tiles */}
        <div className="row" style={{ marginBottom: 16 }}>
          <div className="col-lg-3 col-md-6">
            <div className="ibox float-e-margins">
              <div className="ibox-content" style={{ background: '#1c84c6', color: '#fff', borderRadius: 4, padding: '20px 24px' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{requests.length}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Total Entries</div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="ibox float-e-margins">
              <div className="ibox-content" style={{ background: '#1ab394', color: '#fff', borderRadius: 4, padding: '20px 24px' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{avgOee.toFixed(1)}%</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Avg OEE</div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="ibox float-e-margins">
              <div className="ibox-content" style={{ background: '#f8ac59', color: '#fff', borderRadius: 4, padding: '20px 24px' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{highCount}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>≥85% (Good)</div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="ibox float-e-margins">
              <div className="ibox-content" style={{ background: '#ed5565', color: '#fff', borderRadius: 4, padding: '20px 24px' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{lowCount}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>&lt;65% (Poor)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters + table */}
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              {(['my', 'all'] as const).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}>
                    {t === 'my' ? 'My Entries' : 'All Entries'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="ibox-content">
            {/* Filter row */}
            <div className="row" style={{ marginBottom: 16 }}>
              <div className="col-sm-3">
                <select className="form-control input-sm" value={filters.sectionId}
                  onChange={e => loadLines(e.target.value)}>
                  <option value="">All Sections</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{(s as any).sectionName ?? s.name ?? `Section #${s.id}`}</option>
                  ))}
                </select>
              </div>
              <div className="col-sm-3">
                <select className="form-control input-sm" value={filters.lineId}
                  onChange={e => setFilters(f => ({ ...f, lineId: e.target.value }))}>
                  <option value="">All Lines</option>
                  {lines.map(l => (
                    <option key={l.id} value={l.id}>{(l as any).lineName ?? l.name ?? `Line #${l.id}`}</option>
                  ))}
                </select>
              </div>
              <div className="col-sm-2">
                <input type="date" className="form-control input-sm" value={filters.from}
                  onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
              </div>
              <div className="col-sm-2">
                <input type="date" className="form-control input-sm" value={filters.to}
                  onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
              </div>
              <div className="col-sm-2">
                <button className="btn btn-primary btn-sm btn-block" onClick={loadRequests}>
                  <i className="fa fa-filter" style={{ marginRight: 4 }} />Filter
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 40 }}>
                <i className="fa fa-bar-chart fa-3x" style={{ marginBottom: 12 }} />
                <p>No OEE entries found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-condensed">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Shift</th>
                      <th>Line</th>
                      <th style={{ textAlign: 'center' }}>OEE %</th>
                      <th style={{ textAlign: 'center' }}>Availability</th>
                      <th style={{ textAlign: 'center' }}>Performance</th>
                      <th style={{ textAlign: 'center' }}>Quality</th>
                      <th>Plan / Actual</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => {
                      const oeePct = parseFloat(r.oee ?? '0');
                      return (
                        <tr key={r.id}>
                          <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{r.requestDate}</td>
                          <td>
                            {r.shift && (
                              <span className={`label label-${SHIFT_COLORS[r.shift] ?? 'default'}`}>
                                Shift {r.shift}
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: 12, color: '#666' }}>Line #{r.lineId}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block', minWidth: 52, padding: '2px 8px',
                              borderRadius: 12, background: oeeColor(oeePct), color: '#fff',
                              fontWeight: 700, fontSize: 13,
                            }}>
                              {oeePct.toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: 13 }}>
                            {r.availabilityRate ? `${parseFloat(r.availabilityRate).toFixed(1)}%` : '—'}
                          </td>
                          <td style={{ textAlign: 'center', fontSize: 13 }}>
                            {r.performanceRate ? `${parseFloat(r.performanceRate).toFixed(1)}%` : '—'}
                          </td>
                          <td style={{ textAlign: 'center', fontSize: 13 }}>
                            {r.qualityRate ? `${parseFloat(r.qualityRate).toFixed(1)}%` : '—'}
                          </td>
                          <td style={{ fontSize: 12 }}>
                            <span style={{ color: '#888' }}>{r.productionPlan ?? '—'}</span>
                            {' / '}
                            <span style={{ fontWeight: 600 }}>{r.productionActual ?? '—'}</span>
                          </td>
                          <td>
                            <Link href={`/portal/oee/${r.id}`} className="btn btn-xs btn-white">
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
