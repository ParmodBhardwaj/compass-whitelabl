'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface Task {
  id: number;
  title: string;
  code?: string;
  alias?: string;
  shortDescription?: string;
  description?: string;
  programId: number;
  assignedTo?: number;
  currentOwner?: number;
  createdBy?: number;
  ccEmails?: string;
  mailFrequency?: string;
  startDate?: string;
  endDate?: string;
  completionDate?: string;
  uploadedFile?: string;
  status?: string;
  remarks?: string;
  isRevised?: string;
  isTransfered?: string;
}

interface TaskDetail {
  task: Task;
  users: any[];
  revisions: ReviseRequest[];
  transfers: TransferRequest[];
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

interface CurrentUser {
  id: number;
  name?: string;
  email?: string;
}

type ActionPanel = 'none' | 'update-status' | 'request-revise' | 'request-transfer';

const STATUS_COLOR: Record<string, string> = {
  open: 'primary',
  'in-progress': 'info',
  completed: 'success',
  closed: 'default',
  overdue: 'danger',
};

function isOverdue(task: Task): boolean {
  if (!task.endDate) return false;
  if (task.status === 'completed' || task.status === 'closed') return false;
  return new Date(task.endDate) < new Date(new Date().toDateString());
}

export default function ActivityTrackerDetailPage() {
  const params = useParams<{ id: string }>();
  const taskId = params.id;

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [data, setData] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPanel, setActionPanel] = useState<ActionPanel>('none');
  const [saving, setSaving] = useState(false);

  // Update status form
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');

  // Revise request form
  const [reviseDate, setReviseDate] = useState('');
  const [reviseDesc, setReviseDesc] = useState('');

  // Transfer request form
  const [transferTo, setTransferTo] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [me, detail] = await Promise.all([
          apiFetch<CurrentUser>('/auth/me'),
          apiFetch<TaskDetail>(`/activity-tracker/tasks/${taskId}`),
        ]);
        setUser(me);
        setData(detail);
        setNewStatus(detail.task.status ?? 'open');
        setRemarks(detail.task.remarks ?? '');
      } catch {}
      setLoading(false);
    })();
  }, [taskId]);

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      await apiFetch(`/activity-tracker/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, remarks }),
      });
      const updated = await apiFetch<TaskDetail>(`/activity-tracker/tasks/${taskId}`);
      setData(updated);
      setActionPanel('none');
    } catch {}
    setSaving(false);
  }

  async function handleRequestRevise(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !data) return;
    setSaving(true);
    try {
      await apiFetch(`/activity-tracker/tasks/${taskId}/revise`, {
        method: 'POST',
        body: JSON.stringify({
          sendBy: user.id,
          sendTo: data.task.createdBy,
          newDate: reviseDate,
          description: reviseDesc,
        }),
      });
      const updated = await apiFetch<TaskDetail>(`/activity-tracker/tasks/${taskId}`);
      setData(updated);
      setActionPanel('none');
      setReviseDate('');
      setReviseDesc('');
    } catch {}
    setSaving(false);
  }

  async function handleRequestTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !data) return;
    const toId = parseInt(transferTo);
    if (!toId) return;
    setSaving(true);
    try {
      await apiFetch(`/activity-tracker/tasks/${taskId}/transfer`, {
        method: 'POST',
        body: JSON.stringify({
          sentBy: user.id,
          sentTo: toId,
        }),
      });
      const updated = await apiFetch<TaskDetail>(`/activity-tracker/tasks/${taskId}`);
      setData(updated);
      setActionPanel('none');
      setTransferTo('');
    } catch {}
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="ibox"><div className="ibox-content text-center" style={{ padding: 40 }}>
          <i className="fa fa-spinner fa-spin fa-2x text-muted" />
        </div></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="wrapper wrapper-content">
        <div className="alert alert-danger">Task not found or access denied.</div>
        <Link href="/portal/activity-tracker" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back
        </Link>
      </div>
    );
  }

  const { task, revisions, transfers } = data;
  const taskStatus = isOverdue(task) ? 'overdue' : (task.status ?? 'open');
  const statusCls = STATUS_COLOR[taskStatus] ?? 'default';

  const isOwner = user && (task.currentOwner === user.id || task.assignedTo === user.id);
  const canUpdate = isOwner && task.status !== 'completed' && task.status !== 'closed';
  const pendingRevise = task.isRevised === '1';
  const pendingTransfer = task.isTransfered === '1';

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{task.title}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/activity-tracker">Activity Tracker</Link></li>
            <li className="active"><strong>{task.title}</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span className={`label label-${statusCls}`} style={{ fontSize: 13, padding: '4px 10px', textTransform: 'capitalize' }}>
            {taskStatus}
          </span>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-lg-8">

            {/* Task overview */}
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>Task Details</h5>
              </div>
              <div className="ibox-content">
                {/* Info grid */}
                <div className="row">
                  {task.code && (
                    <div className="col-sm-4">
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 11, textTransform: 'uppercase', color: '#999', display: 'block' }}>Code</label>
                        <code style={{ fontSize: 14 }}>{task.code}</code>
                      </div>
                    </div>
                  )}
                  <div className="col-sm-4">
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, textTransform: 'uppercase', color: '#999', display: 'block' }}>Start Date</label>
                      <span style={{ fontWeight: 600 }}>{task.startDate ?? '—'}</span>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, textTransform: 'uppercase', color: '#999', display: 'block' }}>End Date</label>
                      <span style={{ fontWeight: 600, color: isOverdue(task) ? '#e74c3c' : 'inherit' }}>
                        {task.endDate ?? '—'}
                        {isOverdue(task) && <i className="fa fa-exclamation-triangle text-danger" style={{ marginLeft: 6 }} />}
                      </span>
                    </div>
                  </div>
                  {task.completionDate && (
                    <div className="col-sm-4">
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 11, textTransform: 'uppercase', color: '#999', display: 'block' }}>Completed On</label>
                        <span style={{ fontWeight: 600, color: '#1ab394' }}>{task.completionDate}</span>
                      </div>
                    </div>
                  )}
                  <div className="col-sm-4">
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, textTransform: 'uppercase', color: '#999', display: 'block' }}>Mail Frequency</label>
                      <span className="label label-default" style={{ textTransform: 'capitalize' }}>
                        {task.mailFrequency ?? 'daily'}
                      </span>
                    </div>
                  </div>
                </div>

                {task.shortDescription && (
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 12 }}>
                    {task.shortDescription}
                  </p>
                )}
                {task.description && (
                  <div
                    style={{ fontSize: 14, lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: task.description }}
                  />
                )}
                {task.remarks && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbe6', borderLeft: '4px solid #f1c40f', borderRadius: 3 }}>
                    <strong style={{ fontSize: 12, textTransform: 'uppercase', color: '#888' }}>Remarks:</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 14 }}>{task.remarks}</p>
                  </div>
                )}
                {task.uploadedFile && (
                  <div style={{ marginTop: 12 }}>
                    <a
                      href={`/api/uploads/${task.uploadedFile}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-xs btn-white"
                    >
                      <i className="fa fa-paperclip" style={{ marginRight: 4 }} />Attachment
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action forms */}
            {actionPanel === 'update-status' && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>Update Task Status</h5>
                </div>
                <div className="ibox-content">
                  <form onSubmit={handleUpdateStatus}>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        className="form-control"
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Remarks</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        placeholder="Add any remarks..."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                        {saving ? <><i className="fa fa-spinner fa-spin" /> Saving…</> : 'Update Status'}
                      </button>
                      <button type="button" className="btn btn-white btn-sm" onClick={() => setActionPanel('none')}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {actionPanel === 'request-revise' && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>Request End Date Revision</h5>
                </div>
                <div className="ibox-content">
                  <form onSubmit={handleRequestRevise}>
                    <div className="form-group">
                      <label>New End Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={reviseDate}
                        onChange={e => setReviseDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Reason</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={reviseDesc}
                        onChange={e => setReviseDesc(e.target.value)}
                        placeholder="Explain why the date needs to change..."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" className="btn btn-warning btn-sm" disabled={saving || !reviseDate}>
                        {saving ? <><i className="fa fa-spinner fa-spin" /> Sending…</> : 'Submit Request'}
                      </button>
                      <button type="button" className="btn btn-white btn-sm" onClick={() => setActionPanel('none')}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {actionPanel === 'request-transfer' && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>Request Ownership Transfer</h5>
                </div>
                <div className="ibox-content">
                  <form onSubmit={handleRequestTransfer}>
                    <div className="form-group">
                      <label>Transfer to Employee ID <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={transferTo}
                        onChange={e => setTransferTo(e.target.value)}
                        placeholder="Enter employee ID"
                      />
                      <p className="help-block">Enter the ID of the employee to transfer this task to.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" className="btn btn-info btn-sm" disabled={saving || !transferTo}>
                        {saving ? <><i className="fa fa-spinner fa-spin" /> Sending…</> : 'Submit Transfer Request'}
                      </button>
                      <button type="button" className="btn btn-white btn-sm" onClick={() => setActionPanel('none')}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>

          {/* Right panel */}
          <div className="col-lg-4">

            {/* Actions */}
            {canUpdate && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>Actions</h5>
                </div>
                <div className="ibox-content" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => setActionPanel(actionPanel === 'update-status' ? 'none' : 'update-status')}
                  >
                    <i className="fa fa-check-square-o" style={{ marginRight: 6 }} />Update Status
                  </button>
                  {!pendingRevise && (
                    <button
                      className="btn btn-warning btn-block"
                      onClick={() => setActionPanel(actionPanel === 'request-revise' ? 'none' : 'request-revise')}
                    >
                      <i className="fa fa-calendar" style={{ marginRight: 6 }} />Request Date Revision
                    </button>
                  )}
                  {pendingRevise && (
                    <div className="alert alert-warning" style={{ margin: 0, padding: '8px 12px', fontSize: 13 }}>
                      <i className="fa fa-clock-o" style={{ marginRight: 4 }} />Date revision request pending
                    </div>
                  )}
                  {!pendingTransfer && (
                    <button
                      className="btn btn-info btn-block"
                      onClick={() => setActionPanel(actionPanel === 'request-transfer' ? 'none' : 'request-transfer')}
                    >
                      <i className="fa fa-exchange" style={{ marginRight: 6 }} />Request Transfer
                    </button>
                  )}
                  {pendingTransfer && (
                    <div className="alert alert-info" style={{ margin: 0, padding: '8px 12px', fontSize: 13 }}>
                      <i className="fa fa-clock-o" style={{ marginRight: 4 }} />Transfer request pending
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Revision history */}
            {revisions.length > 0 && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>
                    Revision Requests <small style={{ color: '#999' }}>({revisions.length})</small>
                  </h5>
                </div>
                <div className="ibox-content" style={{ padding: 0 }}>
                  {revisions.map(r => (
                    <div key={r.id} style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>New date: {r.newDate}</span>
                        <span className={`label label-${r.actionTaken === 'approved' ? 'success' : r.actionTaken === 'rejected' ? 'danger' : 'warning'}`}>
                          {r.actionTaken}
                        </span>
                      </div>
                      {r.description && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#777' }}>{r.description}</p>}
                      {r.rejectReason && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#e74c3c' }}>Rejected: {r.rejectReason}</p>}
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#aaa' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transfer history */}
            {transfers.length > 0 && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>
                    Transfer Requests <small style={{ color: '#999' }}>({transfers.length})</small>
                  </h5>
                </div>
                <div className="ibox-content" style={{ padding: 0 }}>
                  {transfers.map(r => (
                    <div key={r.id} style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13 }}>To employee #{r.sentTo}</span>
                        <span className={`label label-${r.actionTaken === 'approved' ? 'success' : r.actionTaken === 'rejected' ? 'danger' : 'warning'}`}>
                          {r.actionTaken}
                        </span>
                      </div>
                      {r.rejectReason && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#e74c3c' }}>Rejected: {r.rejectReason}</p>}
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#aaa' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        <Link href="/portal/activity-tracker" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to Activity Tracker
        </Link>
      </div>
    </>
  );
}
