'use client';
/**
 * /portal/visitors/frequent — Frequent visitor list.
 *
 * Mirrors legacy /visitors/frequent-visitor.html: list of visitors the
 * current employee has invited before, with one-click rebook into the
 * new appointment form.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface FrequentRow {
  visitorName: string;
  mobile: string;
  email?: string;
  visitCount: number;
  lastAppointmentId: number;
}

export default function FrequentVisitorsPage() {
  const [rows, setRows] = useState<FrequentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    apiFetch<FrequentRow[]>('/visitors/frequent?limit=100')
      .then(r => setRows(Array.isArray(r) ? r : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter(r => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      (r.visitorName ?? '').toLowerCase().includes(s) ||
      (r.mobile ?? '').includes(s) ||
      (r.email ?? '').toLowerCase().includes(s)
    );
  });

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-9">
          <h2>Frequent Visitors</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/visitors">Visitor Gate Pass</Link></li>
            <li className="active"><strong>Frequent Visitors</strong></li>
          </ol>
        </div>
        <div className="col-lg-3" style={{ paddingTop: 20, textAlign: 'right' }}>
          <Link href="/portal/visitors/appointment/add" className="btn btn-primary btn-sm">
            <i className="fa fa-plus" style={{ marginRight: 4 }} />New Appointment
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h5 style={{ margin: 0, flex: 1 }}>Visitors you have invited before ({filtered.length})</h5>
            <input
              className="form-control input-sm"
              placeholder="Search name, mobile or email…"
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ width: 280 }}
            />
          </div>
          <div className="ibox-content" style={{ padding: 0 }}>
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 50 }}>
                <i className="fa fa-users fa-3x" style={{ marginBottom: 12, color: '#ddd' }} />
                <p>No frequent visitors yet.</p>
                <p style={{ fontSize: 12 }}>
                  Once you create appointments, the visitors will appear here for quick re-invite.
                </p>
              </div>
            ) : (
              <table className="table table-hover" style={{ marginBottom: 0 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>#</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>Visitor Name</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>Mobile</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>Email</th>
                    <th style={{ padding: '10px 16px', fontSize: 12, textAlign: 'center' }}>Visits</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>Last Appointment</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={`${r.mobile}-${i}`}>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#999' }}>{i + 1}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>{r.visitorName}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13 }}>
                        <i className="fa fa-mobile" style={{ marginRight: 6, color: '#888' }} />
                        {r.mobile}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#1c84c6' }}>{r.email ?? '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, textAlign: 'center' }}>
                        <span className="label label-info" style={{ fontSize: 11 }}>{r.visitCount}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12 }}>
                        <Link href={`/portal/visitors/appointment/${r.lastAppointmentId}`} style={{ color: '#1c84c6' }}>
                          #{r.lastAppointmentId}
                        </Link>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <Link
                          href={`/portal/visitors/appointment/add?prefillMobile=${encodeURIComponent(r.mobile)}&prefillName=${encodeURIComponent(r.visitorName)}&prefillEmail=${encodeURIComponent(r.email ?? '')}`}
                          className="btn btn-xs btn-primary"
                        >
                          <i className="fa fa-plus" style={{ marginRight: 4 }} />Invite Again
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
