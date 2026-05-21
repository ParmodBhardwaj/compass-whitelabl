'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Submission {
  id: number;
  ideaId: number;
  title: string;
  shortDescription?: string;
  isGroup?: string;
  categoryId?: number;
  createdOn?: string;
  updatedOn?: string;
}

export default function MySubmissionsPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<{ id: number }>('/auth/me');
        const data = await apiFetch<Submission[]>(`/idea/submissions?submittedBy=${me.id}`);
        setSubs(data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>My Idea Submissions</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/idea">Idea Portal</Link></li>
            <li className="active"><strong>My Submissions</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Link href="/portal/idea/submit" className="btn btn-primary btn-sm">
            <i className="fa fa-plus" style={{ marginRight: 4 }} />New Idea
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <h5 style={{ margin: 0 }}>
              All Submissions <small style={{ color: '#999' }}>({subs.length})</small>
            </h5>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : subs.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 40 }}>
                <i className="fa fa-lightbulb-o fa-3x" style={{ marginBottom: 12 }} />
                <p>You have not submitted any ideas yet.</p>
                <Link href="/portal/idea/submit" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                  Submit Your First Idea
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Campaign</th>
                      <th>Type</th>
                      <th>Submitted On</th>
                      <th>Last Updated</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ color: '#999', fontSize: 12 }}>{i + 1}</td>
                        <td>
                          <Link href={`/portal/idea/submissions/${s.id}`} style={{ fontWeight: 600 }}>
                            {s.title}
                          </Link>
                          {s.shortDescription && (
                            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                              {s.shortDescription.slice(0, 80)}{s.shortDescription.length > 80 ? '…' : ''}
                            </div>
                          )}
                        </td>
                        <td><span className="label label-default">#{s.ideaId}</span></td>
                        <td>
                          {s.isGroup === '1'
                            ? <span className="label label-info">Group</span>
                            : <span className="label label-default">Individual</span>}
                        </td>
                        <td style={{ fontSize: 12, color: '#888' }}>
                          {s.createdOn ? new Date(s.createdOn).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ fontSize: 12, color: '#888' }}>
                          {s.updatedOn ? new Date(s.updatedOn).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <Link href={`/portal/idea/submissions/${s.id}`} className="btn btn-xs btn-white">
                            <i className="fa fa-eye" style={{ marginRight: 4 }} />View
                          </Link>
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
