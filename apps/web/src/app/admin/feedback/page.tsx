'use client';
/**
 * /admin/feedback — SOP Feedback inbox with inline reply.
 * Each row is a feedback from a portal user against a specific SOP
 * procedure. Admin can post a single reply per row.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Feedback {
  id: number;
  procedureId?: number;
  feedback?: string;
  feedbackDate?: string;
  feedbackReply?: string;
  createdBy?: number;
  createdAt?: string;
  status?: '0' | '1';
}

export default function SopFeedbackAdminPage() {
  const [rows, setRows] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Feedback[]>('/sop/feedback');
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => (r.feedback ?? '').toLowerCase().includes(q));
  }, [rows, search]);

  async function postReply(id: number) {
    setSaving(true);
    try {
      await apiFetch(`/sop/feedback/${id}/reply`, {
        method: 'PUT',
        body: JSON.stringify({ feedbackReply: reply }),
      });
      setEditingId(null);
      setReply('');
      load();
    } catch (e: any) {
      alert(e?.message ?? 'Reply failed');
    } finally { setSaving(false); }
  }

  async function remove(r: Feedback) {
    if (!confirm('Delete this feedback?')) return;
    try {
      await apiFetch(`/sop/feedback/${r.id}`, { method: 'DELETE' });
      load();
    } catch (e: any) { alert(e?.message ?? 'Delete failed'); }
  }

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-12">
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>SOP — Feedback</h2>
          <ol className="breadcrumb" style={{ background: 'transparent', padding: 0, marginBottom: 16 }}>
            <li><Link href="/admin" style={{ color: '#1c84c6' }}>Home</Link></li>
            <li style={{ marginLeft: 6 }}>/ SOP / Feedbacks</li>
          </ol>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0 }}>Feedback ({filtered.length})</h5>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search feedback…"
                style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13, width: 240 }}
              />
            </div>
            <div className="ibox-content">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><i className="fa fa-spinner fa-spin" /></div>
              ) : filtered.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>No feedback yet.</p>
              ) : filtered.map(f => (
                <div key={f.id} style={{
                  border: '1px solid #eee', borderRadius: 5,
                  padding: 16, marginBottom: 14, background: '#fff',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
                        <i className="fa fa-comment" style={{ marginRight: 6 }} />
                        Feedback #{f.id} · SOP #{f.procedureId} · {f.feedbackDate ?? '—'}
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: '#333', lineHeight: 1.6 }}>{f.feedback}</p>
                      {f.feedbackReply && editingId !== f.id && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: '#f4f9ff', borderLeft: '3px solid #1c84c6', fontSize: 13 }}>
                          <strong style={{ color: '#1c84c6', fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Reply</strong>
                          {f.feedbackReply}
                        </div>
                      )}
                      {editingId === f.id && (
                        <div style={{ marginTop: 12 }}>
                          <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            rows={3}
                            placeholder="Type your reply…"
                            style={{
                              width: '100%', padding: 10, borderRadius: 4,
                              border: '1px solid #ccc', fontSize: 13, resize: 'vertical',
                            }}
                          />
                          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                            <button onClick={() => postReply(f.id)} disabled={saving || !reply.trim()} style={btnPrimary}>
                              {saving ? 'Saving…' : 'Post Reply'}
                            </button>
                            <button onClick={() => { setEditingId(null); setReply(''); }} style={btnSecondary}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', gap: 6 }}>
                      {editingId !== f.id && (
                        <button onClick={() => { setEditingId(f.id); setReply(f.feedbackReply ?? ''); }} style={btnSmall('#1c84c6')}>
                          <i className="fa fa-reply" style={{ marginRight: 4 }} />
                          {f.feedbackReply ? 'Edit Reply' : 'Reply'}
                        </button>
                      )}
                      <button onClick={() => remove(f)} style={btnSmall('#ed5565')}>
                        <i className="fa fa-times" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  background: '#1ab394', color: '#fff', border: 'none', borderRadius: 4,
  padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const btnSecondary: React.CSSProperties = {
  background: '#fff', color: '#676a6c', border: '1px solid #e7eaec', borderRadius: 4,
  padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
function btnSmall(color: string): React.CSSProperties {
  return {
    background: color, color: '#fff', border: 'none', borderRadius: 3,
    padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  };
}
