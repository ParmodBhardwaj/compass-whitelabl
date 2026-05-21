'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface SubmissionDetail {
  submission: {
    id: number;
    ideaId: number;
    title: string;
    shortDescription?: string;
    description: string;
    attachment?: string;
    isGroup?: string;
    categoryId?: number;
    submittedBy?: number;
    createdOn?: string;
    updatedOn?: string;
  };
  users: Array<{ id: number; submittedId: number; userId: number }>;
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const [userId, setUserId] = useState<number | null>(null);
  const [data, setData] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', shortDescription: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [me, detail] = await Promise.all([
          apiFetch<{ id: number }>('/auth/me'),
          apiFetch<SubmissionDetail>(`/idea/submissions/${params.id}`),
        ]);
        setUserId(me.id);
        setData(detail);
        setEditForm({
          title: detail.submission.title,
          shortDescription: detail.submission.shortDescription ?? '',
          description: detail.submission.description,
        });
      } catch {}
      setLoading(false);
    })();
  }, [params.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/idea/submissions/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      const updated = await apiFetch<SubmissionDetail>(`/idea/submissions/${params.id}`);
      setData(updated);
      setEditing(false);
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
        <div className="alert alert-danger">Submission not found.</div>
        <Link href="/portal/idea" className="btn btn-white btn-sm">Back</Link>
      </div>
    );
  }

  const { submission, users } = data;
  const isOwner = userId === submission.submittedBy;

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{submission.title}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/idea">Idea Portal</Link></li>
            <li><Link href="/portal/idea/my-submissions">My Submissions</Link></li>
            <li className="active"><strong>#{submission.id}</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          {submission.isGroup === '1'
            ? <span className="label label-info" style={{ fontSize: 12 }}>Group</span>
            : <span className="label label-default" style={{ fontSize: 12 }}>Individual</span>}
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-md-8">
            {/* Content */}
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>Idea Details</h5>
                {isOwner && !editing && (
                  <div className="ibox-tools">
                    <button className="btn btn-xs btn-white" onClick={() => setEditing(true)}>
                      <i className="fa fa-pencil" style={{ marginRight: 4 }} />Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="ibox-content">
                {editing ? (
                  <form onSubmit={handleSave}>
                    <div className="form-group">
                      <label>Title</label>
                      <input className="form-control" value={editForm.title}
                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Short Description</label>
                      <input className="form-control" value={editForm.shortDescription}
                        onChange={e => setEditForm(f => ({ ...f, shortDescription: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Full Description</label>
                      <textarea className="form-control" rows={6} value={editForm.description}
                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                        {saving ? <i className="fa fa-spinner fa-spin" /> : 'Save Changes'}
                      </button>
                      <button type="button" className="btn btn-white btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    {submission.shortDescription && (
                      <p style={{ fontSize: 14, color: '#555', fontStyle: 'italic', marginBottom: 16 }}>
                        {submission.shortDescription}
                      </p>
                    )}
                    <div style={{ fontSize: 14, lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>
                      {submission.description}
                    </div>
                    {submission.attachment && (
                      <div style={{ marginTop: 16, padding: '10px 14px', background: '#f8f9fa', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <i className="fa fa-paperclip text-muted" />
                        <a href={`/api/uploads/${submission.attachment}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: 13 }}>
                          {submission.attachment}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Team members */}
            {submission.isGroup === '1' && users.length > 0 && (
              <div className="ibox float-e-margins">
                <div className="ibox-title"><h5 style={{ margin: 0 }}>Team Members ({users.length})</h5></div>
                <div className="ibox-content">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {users.map(u => (
                      <div key={u.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 12px', background: '#f0f0f0', borderRadius: 20,
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', background: '#1ab394',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className="fa fa-user" style={{ color: '#fff', fontSize: 12 }} />
                        </div>
                        <span style={{ fontSize: 13 }}>Employee #{u.userId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-md-4">
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Submission Info</h5></div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {[
                  { label: 'ID', value: `#${submission.id}` },
                  { label: 'Campaign', value: `#${submission.ideaId}` },
                  { label: 'Type', value: submission.isGroup === '1' ? 'Group' : 'Individual' },
                  { label: 'Submitted By', value: `Employee #${submission.submittedBy}` },
                  { label: 'Submitted On', value: submission.createdOn ? new Date(submission.createdOn).toLocaleDateString() : '—' },
                  { label: 'Last Updated', value: submission.updatedOn ? new Date(submission.updatedOn).toLocaleDateString() : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', padding: '10px 14px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 110, fontSize: 12, color: '#999', textTransform: 'uppercase', flexShrink: 0 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <Link href={`/portal/idea/campaigns/${submission.ideaId}`} className="btn btn-white btn-sm btn-block">
              <i className="fa fa-eye" style={{ marginRight: 4 }} />View Campaign
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Link href="/portal/idea/my-submissions" className="btn btn-white btn-sm">
            <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to My Submissions
          </Link>
        </div>
      </div>
    </>
  );
}
