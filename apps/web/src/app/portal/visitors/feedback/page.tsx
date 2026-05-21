'use client';
/**
 * /portal/visitors/feedback — Pending employee feedback inbox.
 *
 * Mirrors legacy /visitors/pending-employee-feedback.html: list of past
 * appointments where the employee (contactPerson) still owes feedback.
 * One-click inline rating + optional comment, posts to
 * `POST /visitors/appointments/:id/feedback`.
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface PendingAppt {
  id: number;
  company: string;
  visitorLocationId: number;
  passType?: string;
  validFromDate?: string;
  validToDate?: string;
  barcodeNumber?: string;
}

function StarRow({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <i
          key={n}
          className={`fa fa-star`}
          onClick={() => onChange(n)}
          style={{
            cursor: 'pointer',
            fontSize: 18,
            color: n <= value ? '#f8ac59' : '#ddd',
          }}
        />
      ))}
    </div>
  );
}

export default function PendingFeedbackPage() {
  const [rows, setRows] = useState<PendingAppt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<number, { rating: number; comment: string }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch<PendingAppt[]>('/visitors/feedback/pending');
      setRows(Array.isArray(r) ? r : []);
    } catch {
      setRows([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function setField(id: number, patch: Partial<{ rating: number; comment: string }>) {
    setEditing(e => {
      const prev = e[id] ?? { rating: 0, comment: '' };
      return { ...e, [id]: { ...prev, ...patch } };
    });
  }

  async function submit(id: number) {
    const e = editing[id];
    if (!e || !e.rating) {
      setMsg('Please pick a rating before submitting.');
      return;
    }
    setSavingId(id);
    try {
      await apiFetch(`/visitors/appointments/${id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ rating: e.rating, comment: e.comment }),
      });
      setMsg('Feedback recorded — thank you.');
      setRows(rs => rs.filter(r => r.id !== id));
    } catch {
      setMsg('Could not save feedback. Please retry.');
    }
    setSavingId(null);
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-12">
          <h2>Visitor Feedback — Pending</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/visitors">Visitor Gate Pass</Link></li>
            <li className="active"><strong>Pending Feedback</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {msg && (
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            {msg}
            <button type="button" className="close" onClick={() => setMsg(null)}>&times;</button>
          </div>
        )}

        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <h5 style={{ margin: 0 }}>
              <i className="fa fa-comments-o" style={{ marginRight: 8, color: '#f8ac59' }} />
              Feedback awaiting your input ({rows.length})
            </h5>
          </div>
          <div className="ibox-content" style={{ padding: 0 }}>
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 50 }}>
                <i className="fa fa-check-circle fa-3x" style={{ marginBottom: 12, color: '#1ab394' }} />
                <p>You&apos;re all caught up — no pending feedback.</p>
              </div>
            ) : (
              <table className="table" style={{ marginBottom: 0 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>#</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>Company</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>Visit Dates</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>Pass</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>Rating</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}>Comment</th>
                    <th style={{ padding: '10px 16px', fontSize: 12 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const e = editing[r.id] ?? { rating: 0, comment: '' };
                    return (
                      <tr key={r.id}>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#999' }}>
                          <Link href={`/portal/visitors/appointment/${r.id}`}>#{r.id}</Link>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{r.company}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#777' }}>
                          {r.validFromDate} → {r.validToDate}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {r.passType && (
                            <span className={`label label-default`} style={{ textTransform: 'capitalize', fontSize: 11 }}>
                              {r.passType}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StarRow value={e.rating} onChange={n => setField(r.id, { rating: n })} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <input
                            className="form-control input-sm"
                            placeholder="Optional comment…"
                            value={e.comment}
                            onChange={ev => setField(r.id, { comment: ev.target.value })}
                            style={{ width: '100%', minWidth: 200 }}
                          />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            className="btn btn-xs btn-primary"
                            disabled={savingId === r.id || !e.rating}
                            onClick={() => submit(r.id)}
                          >
                            {savingId === r.id ? <i className="fa fa-spinner fa-spin" /> : 'Submit'}
                          </button>
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
