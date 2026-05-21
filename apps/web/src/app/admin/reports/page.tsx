'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getToken } from '@/lib/auth';

interface ReportDef {
  key: string;
  label: string;
  icon: string;
  color: string;
  endpoint: string;
  filters: Filter[];
}

interface Filter {
  key: string;
  label: string;
  type: 'date' | 'text' | 'select';
  options?: { value: string; label: string }[];
}

const REPORTS: ReportDef[] = [
  {
    key: 'training',
    label: 'Training Records',
    icon: 'fa-graduation-cap',
    color: '#1ab394',
    endpoint: '/reports/training',
    filters: [
      { key: 'from', label: 'From Date', type: 'date' },
      { key: 'to', label: 'To Date', type: 'date' },
      {
        key: 'type', label: 'Training Type', type: 'select',
        options: [
          { value: '', label: 'All Types' },
          { value: 'internal', label: 'Internal' },
          { value: 'external', label: 'External' },
          { value: 'online', label: 'Online' },
          { value: 'mandatory', label: 'Mandatory' },
        ],
      },
    ],
  },
  {
    key: 'kaizen',
    label: 'Kaizen Report',
    icon: 'fa-recycle',
    color: '#f8ac59',
    endpoint: '/reports/kaizen',
    filters: [
      { key: 'from', label: 'From Date', type: 'date' },
      { key: 'to', label: 'To Date', type: 'date' },
      {
        key: 'status', label: 'Status', type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'open', label: 'Open' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'closed', label: 'Closed' },
        ],
      },
    ],
  },
  {
    key: 'oee',
    label: 'OEE Report',
    icon: 'fa-bar-chart',
    color: '#1c84c6',
    endpoint: '/reports/oee',
    filters: [
      { key: 'from', label: 'From Date', type: 'date' },
      { key: 'to', label: 'To Date', type: 'date' },
    ],
  },
  {
    key: 'mpsheet',
    label: 'MP Sheet Report',
    icon: 'fa-wrench',
    color: '#ed5565',
    endpoint: '/reports/mpsheet',
    filters: [
      { key: 'from', label: 'From Date', type: 'date' },
      { key: 'to', label: 'To Date', type: 'date' },
      {
        key: 'status', label: 'Status', type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'closed', label: 'Closed' },
        ],
      },
    ],
  },
  {
    key: 'visitors',
    label: 'Visitor Log',
    icon: 'fa-id-card',
    color: '#23c6c8',
    endpoint: '/reports/visitors',
    filters: [
      { key: 'from', label: 'From Date', type: 'date' },
      { key: 'to', label: 'To Date', type: 'date' },
    ],
  },
];

export default function ReportsPage() {
  const [params, setParams] = useState<Record<string, Record<string, string>>>(
    () => Object.fromEntries(REPORTS.map(r => [r.key, {}])),
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  function setParam(reportKey: string, filterKey: string, value: string) {
    setParams(prev => ({
      ...prev,
      [reportKey]: { ...prev[reportKey], [filterKey]: value },
    }));
  }

  async function download(report: ReportDef) {
    setLoading(prev => ({ ...prev, [report.key]: true }));
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params[report.key] ?? {})) {
        if (v) qs.set(k, v);
      }
      const url = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/v2${report.endpoint}?${qs}`;
      const token = getToken();
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${report.key}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e: any) {
      alert(`Download failed: ${e?.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [report.key]: false }));
    }
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Reports</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Admin</Link></li>
            <li className="active"><strong>Reports</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          {REPORTS.map(report => (
            <div key={report.key} className="col-lg-6" style={{ marginBottom: 24 }}>
              <div className="ibox float-e-margins">
                <div className="ibox-title" style={{ background: report.color }}>
                  <h5 style={{ margin: 0, color: '#fff' }}>
                    <i className={`fa ${report.icon}`} style={{ marginRight: 8 }} />
                    {report.label}
                  </h5>
                </div>
                <div className="ibox-content">
                  <div className="row">
                    {report.filters.map(f => (
                      <div
                        key={f.key}
                        className={`col-sm-${Math.floor(12 / report.filters.length)}`}
                      >
                        <div className="form-group" style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{f.label}</label>
                          {f.type === 'select' ? (
                            <select
                              className="form-control input-sm"
                              value={params[report.key]?.[f.key] ?? ''}
                              onChange={e => setParam(report.key, f.key, e.target.value)}
                            >
                              {f.options?.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={f.type}
                              className="form-control input-sm"
                              value={params[report.key]?.[f.key] ?? ''}
                              onChange={e => setParam(report.key, f.key, e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={loading[report.key]}
                    onClick={() => download(report)}
                    style={{ background: report.color, borderColor: report.color }}
                  >
                    {loading[report.key]
                      ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Generating…</>
                      : <><i className="fa fa-download" style={{ marginRight: 6 }} />Download Excel</>
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note about exceljs */}
        <div className="alert alert-info" style={{ margin: '0 0 16px', fontSize: 13 }}>
          <i className="fa fa-info-circle" style={{ marginRight: 6 }} />
          Reports require <code>exceljs</code> installed on the API.
          Run: <code>pnpm --filter @hero/api add exceljs</code>
        </div>
      </div>
    </>
  );
}
