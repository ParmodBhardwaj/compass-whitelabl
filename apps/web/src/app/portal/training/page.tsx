'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface TrainingScore {
  id: number;
  trainingName: string;
  trainingType?: string;
  trainingDate?: string;
  trainingDays?: number;
  trainingLocation?: string;
  trainingLearning?: string;
  trainingScore?: number;
  createdBy?: number;
  createdOn?: string;
}

interface Stats { total: number; avgScore: number; }

interface LeaderRow {
  userId: number;
  name: string;
  designation?: string;
  profilepic?: string;
  totalScore: number;
  trainingCount: number;
}

const TYPE_COLOR: Record<string, string> = {
  internal: 'primary', external: 'info', online: 'success', mandatory: 'warning',
};

export default function TrainingPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [records, setRecords] = useState<TrainingScore[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, avgScore: 0 });
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'my' | 'all' | 'leaderboard'>('my');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    categoryId: 1, trainingType: 'internal', trainingName: '',
    trainingDate: '', trainingDays: '1', trainingLocation: '',
    trainingLearning: '', trainingScore: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const me = await apiFetch<{ id: number }>('/auth/me');
      setUserId(me.id);
      await loadData(me.id);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadData(userId);
  }, [tab]);

  async function loadData(uid: number) {
    setLoading(true);
    try {
      if (tab === 'leaderboard') {
        const [board, st] = await Promise.all([
          apiFetch<LeaderRow[]>('/training/leaderboard?limit=25'),
          apiFetch<Stats>(`/training/stats?createdBy=${uid}`),
        ]);
        setLeaders(Array.isArray(board) ? board : []);
        setStats(st);
      } else {
        const params = new URLSearchParams();
        if (tab === 'my') params.set('createdBy', String(uid));
        else params.set('all', '1');
        const [data, st] = await Promise.all([
          apiFetch<TrainingScore[]>(`/training/scores?${params}`),
          apiFetch<Stats>(`/training/stats?createdBy=${uid}`),
        ]);
        setRecords(data);
        setStats(st);
      }
    } catch {}
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.trainingName || !form.trainingDate) {
      setError('Training Name and Date are required.');
      return;
    }
    if (!userId) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch('/training/scores', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          trainingDays: +form.trainingDays,
          trainingScore: form.trainingScore ? +form.trainingScore : 0,
          createdBy: userId,
        }),
      });
      setShowForm(false);
      setForm({ categoryId: 1, trainingType: 'internal', trainingName: '', trainingDate: '', trainingDays: '1', trainingLocation: '', trainingLearning: '', trainingScore: '' });
      await loadData(userId);
    } catch {
      setError('Failed to log training record.');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    await apiFetch(`/training/scores/${id}`, { method: 'DELETE' });
    setRecords(r => r.filter(x => x.id !== id));
  }

  const scoreColor = (s?: number) => {
    if (!s) return '#888';
    if (s >= 80) return '#1ab394';
    if (s >= 60) return '#f8ac59';
    return '#ed5565';
  };

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Training</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Training</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(f => !f)}>
            <i className="fa fa-plus" style={{ marginRight: 4 }} />Log Training
          </button>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {/* Stats */}
        <div className="row" style={{ marginBottom: 16 }}>
          <div className="col-lg-3 col-sm-6">
            <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
              <div className="ibox-content" style={{ background: '#1c84c6', color: '#fff', borderRadius: 4, padding: '16px 20px' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.total}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Training Records</div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
              <div className="ibox-content" style={{ background: '#1ab394', color: '#fff', borderRadius: 4, padding: '16px 20px' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.avgScore.toFixed(1)}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Avg Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Log form */}
        {showForm && (
          <div className="ibox float-e-margins">
            <div className="ibox-title"><h5 style={{ margin: 0 }}>Log Training Record</h5></div>
            <div className="ibox-content">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-sm-4">
                    <div className="form-group">
                      <label>Training Name <span className="text-danger">*</span></label>
                      <input className="form-control" value={form.trainingName}
                        onChange={e => setForm(f => ({ ...f, trainingName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Type</label>
                      <select className="form-control" value={form.trainingType}
                        onChange={e => setForm(f => ({ ...f, trainingType: e.target.value }))}>
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                        <option value="online">Online</option>
                        <option value="mandatory">Mandatory</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Date <span className="text-danger">*</span></label>
                      <input type="date" className="form-control" value={form.trainingDate}
                        onChange={e => setForm(f => ({ ...f, trainingDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-1">
                    <div className="form-group">
                      <label>Days</label>
                      <input type="number" className="form-control" value={form.trainingDays}
                        onChange={e => setForm(f => ({ ...f, trainingDays: e.target.value }))} min="1" />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label>Score (%)</label>
                      <input type="number" className="form-control" value={form.trainingScore}
                        onChange={e => setForm(f => ({ ...f, trainingScore: e.target.value }))} min="0" max="100" />
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div className="form-group">
                      <label>Location</label>
                      <input className="form-control" value={form.trainingLocation}
                        onChange={e => setForm(f => ({ ...f, trainingLocation: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label>Key Learnings</label>
                      <textarea className="form-control" rows={3} value={form.trainingLearning}
                        onChange={e => setForm(f => ({ ...f, trainingLearning: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? <i className="fa fa-spinner fa-spin" /> : 'Save Record'}
                  </button>
                  <button type="button" className="btn btn-white btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Records / Leaderboard */}
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              {(['my', 'all', 'leaderboard'] as const).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}>
                    {t === 'my' ? 'My Records' : t === 'all' ? 'All Records' : (
                      <><i className="fa fa-trophy" style={{ marginRight: 4, color: '#f8ac59' }} />Leaderboard</>
                    )}
                  </a>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 6 }}>
              <a href="/api/v2/training/reports/score.xlsx" className="btn btn-white btn-xs" target="_blank" rel="noreferrer">
                <i className="fa fa-file-excel-o" style={{ marginRight: 4, color: '#1F8B4C' }} />Score Report
              </a>
              <a href="/api/v2/training/reports/detailed.xlsx" className="btn btn-white btn-xs" target="_blank" rel="noreferrer">
                <i className="fa fa-file-excel-o" style={{ marginRight: 4, color: '#1F8B4C' }} />Detailed Report
              </a>
            </div>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : tab === 'leaderboard' ? (
              leaders.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: 40 }}>
                  <i className="fa fa-trophy fa-3x" style={{ marginBottom: 12 }} />
                  <p>No scores recorded yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ width: 60, textAlign: 'center' }}>Rank</th>
                        <th>Employee</th>
                        <th>Designation</th>
                        <th style={{ textAlign: 'center' }}>Trainings</th>
                        <th style={{ textAlign: 'right' }}>Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaders.map((l, idx) => (
                        <tr key={l.userId}>
                          <td style={{ textAlign: 'center', fontWeight: 700 }}>
                            {idx === 0 ? <span style={{ color: '#f8ac59' }}>🥇</span>
                              : idx === 1 ? <span style={{ color: '#bbb' }}>🥈</span>
                              : idx === 2 ? <span style={{ color: '#cd7f32' }}>🥉</span>
                              : idx + 1}
                          </td>
                          <td style={{ fontWeight: 600 }}>{l.name}</td>
                          <td style={{ fontSize: 12, color: '#888' }}>{l.designation ?? '—'}</td>
                          <td style={{ textAlign: 'center' }}>{l.trainingCount}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#1c84c6' }}>
                            {Number(l.totalScore ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : records.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 40 }}>
                <i className="fa fa-graduation-cap fa-3x" style={{ marginBottom: 12 }} />
                <p>No training records found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Training Name</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Days</th>
                      <th>Location</th>
                      <th style={{ textAlign: 'center' }}>Score</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.trainingName}</strong>
                          {r.trainingLearning && (
                            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                              {r.trainingLearning.slice(0, 80)}{r.trainingLearning.length > 80 ? '…' : ''}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`label label-${TYPE_COLOR[r.trainingType ?? ''] ?? 'default'}`}
                            style={{ textTransform: 'capitalize' }}>
                            {r.trainingType ?? '—'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13 }}>{r.trainingDate ?? '—'}</td>
                        <td style={{ fontSize: 13 }}>{r.trainingDays ?? '—'}</td>
                        <td style={{ fontSize: 13 }}>{r.trainingLocation ?? '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          {r.trainingScore != null ? (
                            <span style={{
                              fontWeight: 700, fontSize: 14,
                              color: scoreColor(r.trainingScore),
                            }}>
                              {r.trainingScore}%
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          {userId === r.createdBy && (
                            <button className="btn btn-xs btn-danger" onClick={() => handleDelete(r.id)}>
                              <i className="fa fa-trash" />
                            </button>
                          )}
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
    </>
  );
}
