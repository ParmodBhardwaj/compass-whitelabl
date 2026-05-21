'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Program {
  id: number;
  title: string;
  alias?: string;
  departmentId?: number;
}

interface Task {
  id: number;
  title: string;
  code?: string;
  shortDescription?: string;
  programId: number;
  program?: Program;
  startDate?: string;
  endDate?: string;
  status?: string;
  mailFrequency?: string;
  currentOwner?: number;
  assignedTo?: number;
  createdBy?: number;
  isRevised?: string;
  isTransfered?: string;
}

interface CurrentUser {
  id: number;
  name?: string;
  email?: string;
}

type TabFilter = 'my' | 'all';

const STATUS_COLOR: Record<string, string> = {
  open: 'primary',
  'in-progress': 'info',
  completed: 'success',
  closed: 'default',
  overdue: 'danger',
};

function isOverdue(task: Task): boolean {
  if (!task.endDate || task.status === 'completed' || task.status === 'closed') return false;
  return new Date(task.endDate) < new Date(new Date().toDateString());
}

function statusLabel(task: Task): string {
  if (isOverdue(task)) return 'overdue';
  return task.status ?? 'open';
}

export default function ActivityTrackerPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>('my');
  const [selectedProgram, setSelectedProgram] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<CurrentUser>('/auth/me');
        setUser(me);
        const [progs, myTasks] = await Promise.all([
          apiFetch<Program[]>('/activity-tracker/programs'),
          apiFetch<Task[]>(`/activity-tracker/tasks?userId=${me.id}`),
        ]);
        setPrograms(Array.isArray(progs) ? progs : []);
        setTasks(Array.isArray(myTasks) ? myTasks : []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  // When tab changes to 'all', fetch all tasks
  useEffect(() => {
    if (tab === 'all' && user) {
      setLoading(true);
      apiFetch<Task[]>('/activity-tracker/tasks?all=1')
        .then(data => setTasks(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === 'my' && user) {
      setLoading(true);
      apiFetch<Task[]>(`/activity-tracker/tasks?userId=${user.id}`)
        .then(data => setTasks(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab, user]);

  const filtered = useMemo(() => {
    let list = tasks;
    if (selectedProgram !== 'all') {
      list = list.filter(t => t.programId === selectedProgram);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.title ?? '').toLowerCase().includes(q) ||
        (t.code ?? '').toLowerCase().includes(q) ||
        (t.shortDescription ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [tasks, selectedProgram, search]);

  // Summary counts
  const counts = useMemo(() => {
    const total = filtered.length;
    const overdue = filtered.filter(isOverdue).length;
    const completed = filtered.filter(t => t.status === 'completed' || t.status === 'closed').length;
    const open = total - completed;
    return { total, overdue, open, completed };
  }, [filtered]);

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Activity Tracker</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Activity Tracker</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>

        {/* Summary tiles */}
        <div className="row" style={{ marginBottom: 16 }}>
          {[
            { label: 'Total Tasks', value: counts.total, cls: 'navy-bg' },
            { label: 'Open', value: counts.open, cls: 'lazur-bg' },
            { label: 'Overdue', value: counts.overdue, cls: 'red-bg' },
            { label: 'Completed', value: counts.completed, cls: 'green-bg' },
          ].map(tile => (
            <div key={tile.label} className="col-lg-3 col-md-6">
              <div className={`widget style1 ${tile.cls}`} style={{ borderRadius: 4, marginBottom: 8 }}>
                <div className="row">
                  <div className="col-xs-4" style={{ padding: '10px 0 10px 20px' }}>
                    <i className="fa fa-tasks fa-3x" style={{ color: 'rgba(255,255,255,0.6)' }} />
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

        {/* Filter bar */}
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <h5 style={{ margin: 0 }}>Tasks</h5>
            <div className="ibox-tools" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select
                className="form-control input-sm"
                style={{ width: 180 }}
                value={selectedProgram}
                onChange={e => setSelectedProgram(e.target.value === 'all' ? 'all' : +e.target.value)}
              >
                <option value="all">All Programs</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <input
                className="form-control input-sm"
                style={{ width: 200 }}
                placeholder="Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="ibox-content">
            {/* Tabs */}
            <ul className="nav nav-tabs" style={{ marginBottom: 16 }}>
              <li className={tab === 'my' ? 'active' : ''}>
                <a href="#" onClick={e => { e.preventDefault(); setTab('my'); }}>
                  <i className="fa fa-user" style={{ marginRight: 4 }} />My Tasks
                </a>
              </li>
              <li className={tab === 'all' ? 'active' : ''}>
                <a href="#" onClick={e => { e.preventDefault(); setTab('all'); }}>
                  <i className="fa fa-list" style={{ marginRight: 4 }} />All Tasks
                </a>
              </li>
            </ul>

            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted" style={{ padding: 30 }}>No tasks found.</p>
            ) : (
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>Code</th>
                    <th>Task</th>
                    <th style={{ width: 140 }}>Program</th>
                    <th style={{ width: 100 }}>Start Date</th>
                    <th style={{ width: 100 }}>End Date</th>
                    <th style={{ width: 80, textAlign: 'center' }}>Freq.</th>
                    <th style={{ width: 110, textAlign: 'center' }}>Status</th>
                    <th style={{ width: 80 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => {
                    const st = statusLabel(t);
                    const cls = STATUS_COLOR[st] ?? 'default';
                    return (
                      <tr key={t.id}>
                        <td style={{ verticalAlign: 'middle' }}>
                          {t.code ? <code>{t.code}</code> : <span className="text-muted">—</span>}
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <Link href={`/portal/activity-tracker/${t.id}`} style={{ fontWeight: 600 }}>
                            {t.title}
                          </Link>
                          {t.shortDescription && (
                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#999' }}>
                              {t.shortDescription}
                            </p>
                          )}
                          {t.isRevised === '1' && (
                            <span className="label label-warning" style={{ marginLeft: 4, fontSize: 10 }}>Revision Pending</span>
                          )}
                          {t.isTransfered === '1' && (
                            <span className="label label-info" style={{ marginLeft: 4, fontSize: 10 }}>Transfer Pending</span>
                          )}
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          {(t.program as any)?.title ?? programs.find(p => p.id === t.programId)?.title ?? '—'}
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>{t.startDate}</td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <span style={{ color: isOverdue(t) ? '#e74c3c' : 'inherit', fontWeight: isOverdue(t) ? 600 : undefined }}>
                            {t.endDate}
                          </span>
                        </td>
                        <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                          <span className="label label-default" style={{ textTransform: 'capitalize' }}>
                            {t.mailFrequency ?? 'daily'}
                          </span>
                        </td>
                        <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                          <span className={`label label-${cls}`} style={{ textTransform: 'capitalize' }}>
                            {st}
                          </span>
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <Link href={`/portal/activity-tracker/${t.id}`} className="btn btn-xs btn-primary">
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
