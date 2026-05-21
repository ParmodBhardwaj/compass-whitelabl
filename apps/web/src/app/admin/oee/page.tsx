'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface OeeRecord {
  id: number;
  shiftDate?: string;
  shift?: string;
  machineName?: string;
  availability?: number;
  performance?: number;
  quality?: number;
  oee?: number;
  totalParts?: number;
  goodParts?: number;
  rejectParts?: number;
  createdBy?: number;
}

interface Stats {
  total: number;
  avgOee: number;
  good: number;
  poor: number;
}

function oeeColor(pct: number): string {
  if (pct >= 85) return '#1ab394';
  if (pct >= 65) return '#f8ac59';
  return '#ed5565';
}

export default function OeeAdminPage() {
  const [records, setRecords] = useState<OeeRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, avgOee: 0, good: 0, poor: 0 });
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams({ all: '1' });
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const data = await apiFetch<OeeRecord[]>(`/oee/requests?${qs}`);
    setRecords(data);

    // Compute stats client-side
    const total = data.length;
    const oeePcts = data.map(r => computeOee(r));
    const avgOee = total > 0 ? oeePcts.reduce((a, b) => a + b, 0) / total : 0;
    const good = oeePcts.filter(v => v >= 85).length;
    const poor = oeePcts.filter(v => v < 65).length;
    setStats({ total, avgOee, good, poor });
    setLoading(false);
  }

  function computeOee(r: OeeRecord): number {
    const a = r.availability ?? 0;
    const p = r.performance ?? 0;
    const q = r.quality ?? 0;
    return (a / 100) * (p / 100) * (q / 100) * 100;
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>OEE — Admin Overview</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Admin</Link></li>
            <li className="active"><strong>OEE</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Stats */}
        <div className="row" style={{ marginBottom: 16 }}>
          {[
            { label: 'Total Records', value: stats.total, color: '#1c84c6' },
            { label: 'Avg OEE %', value: stats.avgOee.toFixed(1), color: '#1ab394' },
            { label: '≥ 85% (Good)', value: stats.good, color: '#1ab394' },
            { label: '< 65% (Poor)', value: stats.poor, color: '#ed5565' },
          ].map(s => (
            <div key={s.label} className="col-lg-3 col-sm-6">
              <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
                <div className="ibox-content" style={{ background: s.color, color: '#fff', borderRadius: 4, padding: '14px 20px' }}>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <h5 style={{ margin: 0 }}>All OEE Records</h5>
          </div>
          <div className="ibox-content">
            {/* Filters */}
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: 12, color: '#888' }}>From</label>
                <input type="date" className="form-control input-sm" value={from}
                  onChange={e => setFrom(e.target.value)} style={{ width: 150 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#888' }}>To</label>
                <input type="date" className="form-control input-sm" value={to}
                  onChange={e => setTo(e.target.value)} style={{ width: 150 }} />
              </div>
              <button className="btn btn-default btn-sm" onClick={load}>
                <i className="fa fa-filter" style={{ marginRight: 4 }} />Filter
              </button>
              <Link href="/admin/reports" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
                <i className="fa fa-download" style={{ marginRight: 4 }} />Excel Report
              </Link>
            </div>

            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th><th>Shift</th><th>Machine</th>
                      <th>Avail %</th><th>Perf %</th><th>Quality %</th>
                      <th style={{ textAlign: 'center' }}>OEE %</th>
                      <th>Parts (Good / Total)</th><th>Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => {
                      const oee = computeOee(r);
                      return (
                        <tr key={r.id}>
                          <td style={{ fontSize: 12 }}>{r.shiftDate ?? '—'}</td>
                          <td style={{ fontSize: 12 }}>{r.shift ?? '—'}</td>
                          <td><strong style={{ fontSize: 13 }}>{r.machineName ?? '—'}</strong></td>
                          <td style={{ fontSize: 13 }}>{r.availability != null ? `${r.availability}%` : '—'}</td>
                          <td style={{ fontSize: 13 }}>{r.performance != null ? `${r.performance}%` : '—'}</td>
                          <td style={{ fontSize: 13 }}>{r.quality != null ? `${r.quality}%` : '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: oeeColor(oee) }}>
                              {oee.toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ fontSize: 12 }}>
                            {r.goodParts != null ? `${r.goodParts} / ${r.totalParts ?? '?'}` : '—'}
                          </td>
                          <td style={{ fontSize: 12, color: '#888' }}>{r.createdBy ?? '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {records.length === 0 && (
                  <div className="text-center text-muted" style={{ padding: 24 }}>No OEE records found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
