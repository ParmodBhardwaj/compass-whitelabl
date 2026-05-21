'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/auth';
import { AdminDataTable, StatusBadge } from '@/components/admin/AdminDataTable';
import { RichEditor } from '@/components/admin/RichEditor';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface Program {
  id?: number;
  title: string;
  alias?: string;
  departmentId?: number;
  sortOrder?: number;
  status?: string;
}

interface Task {
  id?: number;
  title: string;
  code?: string;
  alias?: string;
  shortDescription?: string;
  description?: string;
  programId?: number;
  assignedTo?: number;
  currentOwner?: number;
  ccEmails?: string;
  mailFrequency: string;
  startDate: string;
  endDate: string;
  uploadedFile?: string;
  status?: string;
  remarks?: string;
  createdBy?: number;
}

interface ReviseRequest {
  id: number;
  taskId: number;
  sendBy: number;
  sendTo: number;
  description?: string;
  newDate?: string;
  actionTaken: string;
  rejectReason?: string;
  createdAt: string;
}

interface TransferRequest {
  id: number;
  taskId: number;
  sentBy: number;
  sentTo: number;
  ownershipType?: string;
  actionTaken: string;
  rejectReason?: string;
  createdAt: string;
}

type Section = 'programs' | 'tasks' | 'requests';
type View = 'list' | 'add' | 'edit';

const BLANK_PROGRAM: Program = { title: '', alias: '', departmentId: undefined, sortOrder: 0, status: '1' };
const today = new Date().toISOString().slice(0, 10);
const BLANK_TASK: Task = {
  title: '', code: '', shortDescription: '', description: '',
  programId: undefined, assignedTo: undefined, currentOwner: undefined,
  ccEmails: '', mailFrequency: 'daily',
  startDate: today, endDate: today,
  status: 'open', remarks: '',
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ActivityTrackerAdmin() {
  const [section, setSection] = useState<Section>('programs');
  const [userId, setUserId] = useState<number>(0);

  // Programs state
  const [progView, setProgView] = useState<View>('list');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [progForm, setProgForm] = useState<Program>(BLANK_PROGRAM);
  const [savingProg, setSavingProg] = useState(false);
  const [progMsg, setProgMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Tasks state
  const [taskView, setTaskView] = useState<View>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskForm, setTaskForm] = useState<Task>(BLANK_TASK);
  const [savingTask, setSavingTask] = useState(false);
  const [taskMsg, setTaskMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Requests state
  const [reviseReqs, setReviseReqs] = useState<ReviseRequest[]>([]);
  const [transferReqs, setTransferReqs] = useState<TransferRequest[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectFor, setShowRejectFor] = useState<{ type: 'revise' | 'transfer'; id: number } | null>(null);

  // Get current user
  useEffect(() => {
    apiFetch<{ id: number }>('/auth/me').then(u => setUserId(u.id)).catch(() => {});
  }, []);

  const loadPrograms = useCallback(async () => {
    try {
      const data = await apiFetch<Program[]>('/activity-tracker/programs?all=1');
      setPrograms(Array.isArray(data) ? data : []);
    } catch { setPrograms([]); }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const data = await apiFetch<Task[]>('/activity-tracker/tasks?all=1');
      setTasks(Array.isArray(data) ? data : []);
    } catch { setTasks([]); }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const all = await apiFetch<Task[]>('/activity-tracker/tasks?all=1');
      const taskIds = (Array.isArray(all) ? all : []).map((t: any) => t.id);
      // Load revise and transfer requests for pending tasks
      const pending = (Array.isArray(all) ? all : []).filter((t: any) => t.isRevised === '1' || t.isTransfered === '1');
      const revises: ReviseRequest[] = [];
      const transfers: TransferRequest[] = [];
      for (const t of pending) {
        if ((t as any).isRevised === '1') {
          const detail = await apiFetch<any>(`/activity-tracker/tasks/${(t as any).id}`);
          if (detail?.revisions?.length) {
            revises.push(...detail.revisions.filter((r: any) => r.actionTaken === 'pending'));
          }
        }
        if ((t as any).isTransfered === '1') {
          const detail = await apiFetch<any>(`/activity-tracker/tasks/${(t as any).id}`);
          if (detail?.transfers?.length) {
            transfers.push(...detail.transfers.filter((r: any) => r.actionTaken === 'pending'));
          }
        }
      }
      setReviseReqs(revises);
      setTransferReqs(transfers);
    } catch {}
  }, []);

  useEffect(() => {
    loadPrograms();
    loadTasks();
    loadRequests();
  }, [loadPrograms, loadTasks, loadRequests]);

  // ── Program actions ──────────────────────────────────────────────────────────

  async function saveProg() {
    if (!progForm.title?.trim()) { setProgMsg({ type: 'danger', text: 'Title is required.' }); return; }
    setSavingProg(true);
    try {
      const body = { ...progForm, alias: progForm.alias || slugify(progForm.title) };
      if (progForm.id) {
        await apiFetch(`/activity-tracker/programs/${progForm.id}`, { method: 'PUT', body: JSON.stringify(body) });
        setProgMsg({ type: 'success', text: 'Program updated.' });
      } else {
        await apiFetch('/activity-tracker/programs', { method: 'POST', body: JSON.stringify(body) });
        setProgMsg({ type: 'success', text: 'Program created.' });
        setProgForm(BLANK_PROGRAM);
      }
      await loadPrograms();
      setProgView('list');
    } catch { setProgMsg({ type: 'danger', text: 'Failed to save.' }); }
    setSavingProg(false);
  }

  async function deleteProg(id: number) {
    if (!confirm('Delete this program? Tasks under it will not be deleted.')) return;
    await apiFetch(`/activity-tracker/programs/${id}`, { method: 'DELETE' });
    await loadPrograms();
  }

  // ── Task actions ─────────────────────────────────────────────────────────────

  async function saveTask() {
    if (!taskForm.title?.trim()) { setTaskMsg({ type: 'danger', text: 'Title is required.' }); return; }
    if (!taskForm.programId) { setTaskMsg({ type: 'danger', text: 'Program is required.' }); return; }
    if (!taskForm.startDate || !taskForm.endDate) { setTaskMsg({ type: 'danger', text: 'Start and End dates are required.' }); return; }
    setSavingTask(true);
    try {
      const body = { ...taskForm, alias: taskForm.alias || slugify(taskForm.title), createdBy: userId };
      if (taskForm.id) {
        await apiFetch(`/activity-tracker/tasks/${taskForm.id}`, { method: 'PUT', body: JSON.stringify(body) });
        setTaskMsg({ type: 'success', text: 'Task updated.' });
      } else {
        await apiFetch('/activity-tracker/tasks', { method: 'POST', body: JSON.stringify(body) });
        setTaskMsg({ type: 'success', text: 'Task created.' });
        setTaskForm(BLANK_TASK);
      }
      await loadTasks();
      setTaskView('list');
    } catch { setTaskMsg({ type: 'danger', text: 'Failed to save.' }); }
    setSavingTask(false);
  }

  async function deleteTask(id: number) {
    if (!confirm('Delete this task?')) return;
    await apiFetch(`/activity-tracker/tasks/${id}`, { method: 'DELETE' });
    await loadTasks();
  }

  // ── Request approval actions ──────────────────────────────────────────────────

  async function approveRevise(id: number) {
    setProcessingId(id);
    await apiFetch(`/activity-tracker/revise-requests/${id}/action`, {
      method: 'PUT',
      body: JSON.stringify({ actionTaken: 'approved' }),
    });
    await loadRequests();
    setProcessingId(null);
  }

  async function rejectRevise(id: number) {
    setProcessingId(id);
    await apiFetch(`/activity-tracker/revise-requests/${id}/action`, {
      method: 'PUT',
      body: JSON.stringify({ actionTaken: 'rejected', rejectReason }),
    });
    setRejectReason('');
    setShowRejectFor(null);
    await loadRequests();
    setProcessingId(null);
  }

  async function approveTransfer(id: number) {
    setProcessingId(id);
    await apiFetch(`/activity-tracker/transfer-requests/${id}/action`, {
      method: 'PUT',
      body: JSON.stringify({ actionTaken: 'approved' }),
    });
    await loadRequests();
    setProcessingId(null);
  }

  async function rejectTransfer(id: number) {
    setProcessingId(id);
    await apiFetch(`/activity-tracker/transfer-requests/${id}/action`, {
      method: 'PUT',
      body: JSON.stringify({ actionTaken: 'rejected', rejectReason }),
    });
    setRejectReason('');
    setShowRejectFor(null);
    await loadRequests();
    setProcessingId(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const pendingCount = reviseReqs.length + transferReqs.length;

  return (
    <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px', minHeight: 0, padding: 0 }}>
      {/* Hidden heading strip */}
      <div style={{ display: 'none' }}><h2>Activity Tracker Admin</h2></div>
      <div style={{ padding: '0 15px 15px' }}>
        {/* Section tabs */}
        <ul className="nav nav-tabs" style={{ marginTop: 20, marginBottom: 0 }}>
          <li className={section === 'programs' ? 'active' : ''}>
            <a href="#" onClick={e => { e.preventDefault(); setSection('programs'); setProgView('list'); }}>
              <i className="fa fa-folder-open" style={{ marginRight: 5 }} />Programs
            </a>
          </li>
          <li className={section === 'tasks' ? 'active' : ''}>
            <a href="#" onClick={e => { e.preventDefault(); setSection('tasks'); setTaskView('list'); }}>
              <i className="fa fa-tasks" style={{ marginRight: 5 }} />Tasks
            </a>
          </li>
          <li className={section === 'requests' ? 'active' : ''}>
            <a href="#" onClick={e => { e.preventDefault(); setSection('requests'); }}>
              <i className="fa fa-inbox" style={{ marginRight: 5 }} />
              Pending Requests
              {pendingCount > 0 && (
                <span className="badge" style={{ marginLeft: 6, background: '#e74c3c' }}>{pendingCount}</span>
              )}
            </a>
          </li>
        </ul>

        {/* ── Programs ── */}
        {section === 'programs' && (
          <div style={{ marginTop: 0 }}>
            {progView === 'list' ? (
              <AdminDataTable<Program>
                title="Programs"
                breadcrumb={[{ label: 'Admin' }, { label: 'Activity Tracker' }, { label: 'Programs' }]}
                addButton={{ label: 'Add Program', onClick: () => { setProgForm(BLANK_PROGRAM); setProgMsg(null); setProgView('add'); } }}
                columns={[
                  { header: '#', width: 60, cell: r => r.id },
                  { header: 'Title', sortKey: 'title', cell: r => r.title },
                  { header: 'Order', width: 80, cell: r => r.sortOrder },
                  { header: 'Status', width: 90, cell: r => <StatusBadge value={r.status === '1'} /> },
                  {
                    header: 'Action', width: 120,
                    cell: r => (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-xs btn-white" onClick={() => { setProgForm({ ...r }); setProgMsg(null); setProgView('edit'); }}>
                          <i className="fa fa-pencil" />
                        </button>
                        <button className="btn btn-xs btn-danger" onClick={() => deleteProg(r.id!)}>
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    ),
                  },
                ]}
                rows={programs}
                rowKey={r => r.id ?? 0}
              />
            ) : (
              <div className="ibox float-e-margins" style={{ marginTop: 20 }}>
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>{progView === 'add' ? 'Add Program' : 'Edit Program'}</h5>
                </div>
                <div className="ibox-content">
                  {progMsg && (
                    <div className={`alert alert-${progMsg.type}`} style={{ marginBottom: 16 }}>{progMsg.text}</div>
                  )}
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Title <span className="text-danger">*</span></label>
                        <input className="form-control" value={progForm.title}
                          onChange={e => setProgForm(f => ({
                            ...f, title: e.target.value,
                            alias: progView === 'add' ? slugify(e.target.value) : f.alias,
                          }))} />
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Alias</label>
                        <input className="form-control" value={progForm.alias ?? ''} readOnly
                          style={{ background: '#f5f5f5' }} />
                      </div>
                    </div>
                    <div className="col-sm-2">
                      <div className="form-group">
                        <label>Sort Order</label>
                        <input type="number" className="form-control" value={progForm.sortOrder ?? 0}
                          onChange={e => setProgForm(f => ({ ...f, sortOrder: +e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-2">
                      <div className="form-group">
                        <label>Status</label>
                        <select className="form-control" value={progForm.status ?? '1'}
                          onChange={e => setProgForm(f => ({ ...f, status: e.target.value }))}>
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={saveProg} disabled={savingProg}>
                      {savingProg ? <><i className="fa fa-spinner fa-spin" /> Saving…</> : 'Save Program'}
                    </button>
                    <button className="btn btn-white" onClick={() => setProgView('list')}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tasks ── */}
        {section === 'tasks' && (
          <div style={{ marginTop: 0 }}>
            {taskView === 'list' ? (
              <AdminDataTable<Task>
                title="Tasks"
                breadcrumb={[{ label: 'Admin' }, { label: 'Activity Tracker' }, { label: 'Tasks' }]}
                addButton={{ label: 'Add Task', onClick: () => { setTaskForm(BLANK_TASK); setTaskMsg(null); setTaskView('add'); } }}
                columns={[
                  { header: '#', width: 60, cell: r => r.id },
                  { header: 'Code', width: 80, cell: r => r.code ? <code>{r.code}</code> : <span className="text-muted">—</span> },
                  { header: 'Title', sortKey: 'title', cell: r => r.title },
                  { header: 'Due', width: 100, sortKey: 'endDate', cell: r => r.endDate },
                  { header: 'Freq.', width: 80, cell: r => r.mailFrequency },
                  {
                    header: 'Status', width: 90, cell: r => {
                      const cls: Record<string, string> = { open: 'primary', 'in-progress': 'info', completed: 'success', closed: 'default' };
                      return <span className={`label label-${cls[r.status ?? ''] ?? 'default'}`}>{r.status ?? 'open'}</span>;
                    },
                  },
                  {
                    header: 'Action', width: 120,
                    cell: r => (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-xs btn-white" onClick={() => { setTaskForm({ ...r }); setTaskMsg(null); setTaskView('edit'); }}>
                          <i className="fa fa-pencil" />
                        </button>
                        <button className="btn btn-xs btn-danger" onClick={() => deleteTask(r.id!)}>
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    ),
                  },
                ]}
                rows={tasks}
                rowKey={r => r.id ?? 0}
              />
            ) : (
              <div className="ibox float-e-margins" style={{ marginTop: 20 }}>
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>{taskView === 'add' ? 'Add Task' : 'Edit Task'}</h5>
                </div>
                <div className="ibox-content">
                  {taskMsg && (
                    <div className={`alert alert-${taskMsg.type}`} style={{ marginBottom: 16 }}>{taskMsg.text}</div>
                  )}
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Title <span className="text-danger">*</span></label>
                        <input className="form-control" value={taskForm.title}
                          onChange={e => setTaskForm(f => ({
                            ...f, title: e.target.value,
                            alias: taskView === 'add' ? slugify(e.target.value) : f.alias,
                          }))} />
                      </div>
                    </div>
                    <div className="col-sm-2">
                      <div className="form-group">
                        <label>Code</label>
                        <input className="form-control" value={taskForm.code ?? ''}
                          onChange={e => setTaskForm(f => ({ ...f, code: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label>Program <span className="text-danger">*</span></label>
                        <select className="form-control" value={taskForm.programId ?? ''}
                          onChange={e => setTaskForm(f => ({ ...f, programId: +e.target.value }))}>
                          <option value="">— Select Program —</option>
                          {programs.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Start Date <span className="text-danger">*</span></label>
                        <input type="date" className="form-control" value={taskForm.startDate}
                          onChange={e => setTaskForm(f => ({ ...f, startDate: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>End Date <span className="text-danger">*</span></label>
                        <input type="date" className="form-control" value={taskForm.endDate}
                          onChange={e => setTaskForm(f => ({ ...f, endDate: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Mail Frequency</label>
                        <select className="form-control" value={taskForm.mailFrequency}
                          onChange={e => setTaskForm(f => ({ ...f, mailFrequency: e.target.value }))}>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Status</label>
                        <select className="form-control" value={taskForm.status ?? 'open'}
                          onChange={e => setTaskForm(f => ({ ...f, status: e.target.value }))}>
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label>Assigned To (Employee ID)</label>
                        <input type="number" className="form-control" value={taskForm.assignedTo ?? ''}
                          onChange={e => setTaskForm(f => ({ ...f, assignedTo: e.target.value ? +e.target.value : undefined }))} />
                      </div>
                    </div>
                    <div className="col-sm-8">
                      <div className="form-group">
                        <label>CC Emails (comma-separated)</label>
                        <input className="form-control" value={taskForm.ccEmails ?? ''}
                          onChange={e => setTaskForm(f => ({ ...f, ccEmails: e.target.value }))}
                          placeholder="e.g. manager@hero.com, team@hero.com" />
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label>Short Description</label>
                        <textarea className="form-control" rows={2} value={taskForm.shortDescription ?? ''}
                          onChange={e => setTaskForm(f => ({ ...f, shortDescription: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label>Description</label>
                        <RichEditor
                          value={taskForm.description ?? ''}
                          onChange={v => setTaskForm(f => ({ ...f, description: v }))}
                        />
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label>Remarks</label>
                        <textarea className="form-control" rows={2} value={taskForm.remarks ?? ''}
                          onChange={e => setTaskForm(f => ({ ...f, remarks: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={saveTask} disabled={savingTask}>
                      {savingTask ? <><i className="fa fa-spinner fa-spin" /> Saving…</> : 'Save Task'}
                    </button>
                    <button className="btn btn-white" onClick={() => setTaskView('list')}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Pending Requests ── */}
        {section === 'requests' && (
          <div style={{ marginTop: 20 }}>

            {/* Revise Requests */}
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>
                  Date Revision Requests
                  {reviseReqs.length > 0 && <span className="badge" style={{ marginLeft: 6, background: '#f39c12' }}>{reviseReqs.length}</span>}
                </h5>
              </div>
              <div className="ibox-content">
                {reviseReqs.length === 0 ? (
                  <p className="text-muted text-center" style={{ padding: 20 }}>No pending revision requests.</p>
                ) : (
                  <table className="table table-hover table-bordered">
                    <thead>
                      <tr>
                        <th>Task ID</th>
                        <th>Requested New Date</th>
                        <th>Reason</th>
                        <th>Requested</th>
                        <th style={{ width: 160 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviseReqs.map(r => (
                        <tr key={r.id}>
                          <td><code>#{r.taskId}</code></td>
                          <td style={{ fontWeight: 600 }}>{r.newDate}</td>
                          <td>{r.description ?? '—'}</td>
                          <td style={{ fontSize: 12, color: '#999' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td>
                            {showRejectFor?.type === 'revise' && showRejectFor.id === r.id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <input
                                  className="form-control input-sm"
                                  placeholder="Reject reason..."
                                  value={rejectReason}
                                  onChange={e => setRejectReason(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button className="btn btn-xs btn-danger" onClick={() => rejectRevise(r.id)} disabled={processingId === r.id}>
                                    Reject
                                  </button>
                                  <button className="btn btn-xs btn-white" onClick={() => setShowRejectFor(null)}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-xs btn-success" onClick={() => approveRevise(r.id)} disabled={processingId === r.id}>
                                  <i className="fa fa-check" /> Approve
                                </button>
                                <button className="btn btn-xs btn-danger" onClick={() => { setShowRejectFor({ type: 'revise', id: r.id }); setRejectReason(''); }}>
                                  <i className="fa fa-times" /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Transfer Requests */}
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>
                  Ownership Transfer Requests
                  {transferReqs.length > 0 && <span className="badge" style={{ marginLeft: 6, background: '#3498db' }}>{transferReqs.length}</span>}
                </h5>
              </div>
              <div className="ibox-content">
                {transferReqs.length === 0 ? (
                  <p className="text-muted text-center" style={{ padding: 20 }}>No pending transfer requests.</p>
                ) : (
                  <table className="table table-hover table-bordered">
                    <thead>
                      <tr>
                        <th>Task ID</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Type</th>
                        <th>Requested</th>
                        <th style={{ width: 160 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transferReqs.map(r => (
                        <tr key={r.id}>
                          <td><code>#{r.taskId}</code></td>
                          <td><code>#{r.sentBy}</code></td>
                          <td><code>#{r.sentTo}</code></td>
                          <td>{r.ownershipType ?? 'full'}</td>
                          <td style={{ fontSize: 12, color: '#999' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td>
                            {showRejectFor?.type === 'transfer' && showRejectFor.id === r.id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <input
                                  className="form-control input-sm"
                                  placeholder="Reject reason..."
                                  value={rejectReason}
                                  onChange={e => setRejectReason(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button className="btn btn-xs btn-danger" onClick={() => rejectTransfer(r.id)} disabled={processingId === r.id}>
                                    Reject
                                  </button>
                                  <button className="btn btn-xs btn-white" onClick={() => setShowRejectFor(null)}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-xs btn-success" onClick={() => approveTransfer(r.id)} disabled={processingId === r.id}>
                                  <i className="fa fa-check" /> Approve
                                </button>
                                <button className="btn btn-xs btn-danger" onClick={() => { setShowRejectFor({ type: 'transfer', id: r.id }); setRejectReason(''); }}>
                                  <i className="fa fa-times" /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
