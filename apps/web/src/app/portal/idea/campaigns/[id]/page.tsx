'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface CampaignDetail {
  portal: {
    ideaId: number;
    title: string;
    description?: string;
    status?: string;
    startForm?: string;
    startEnd?: string;
    teamSize?: number;
    createdAt?: string;
  };
  categories: Array<{ id: number; name: string; description?: string }>;
  banners: Array<{ id: number; title?: string }>;
}

interface Submission {
  id: number;
  title: string;
  shortDescription?: string;
  isGroup?: string;
  createdOn?: string;
}

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<CampaignDetail | null>(null);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'submissions'>('overview');

  useEffect(() => {
    (async () => {
      try {
        const [detail, submissions] = await Promise.all([
          apiFetch<CampaignDetail>(`/idea/campaigns/${params.id}`),
          apiFetch<Submission[]>(`/idea/submissions?ideaId=${params.id}&all=1`),
        ]);
        setData(detail);
        setSubs(submissions);
      } catch {}
      setLoading(false);
    })();
  }, [params.id]);

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
        <div className="alert alert-danger">Campaign not found.</div>
        <Link href="/portal/idea" className="btn btn-white btn-sm">Back</Link>
      </div>
    );
  }

  const { portal, categories } = data;
  const today = new Date().toISOString().slice(0, 10);
  const isActive = portal.status === '1'
    && (!portal.startForm || portal.startForm <= today)
    && (!portal.startEnd || portal.startEnd >= today);

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{portal.title}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/idea">Idea Portal</Link></li>
            <li className="active"><strong>{portal.title}</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <span className={`label label-${isActive ? 'success' : 'default'}`} style={{ fontSize: 12 }}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {isActive && (
            <Link href={`/portal/idea/submit?campaignId=${portal.ideaId}`} className="btn btn-primary btn-sm">
              <i className="fa fa-lightbulb-o" style={{ marginRight: 4 }} />Submit Idea
            </Link>
          )}
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              {(['overview', 'submissions'] as const).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}
                    style={{ textTransform: 'capitalize' }}>
                    {t === 'submissions' ? `Submissions (${subs.length})` : 'Overview'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="ibox-content">
            {tab === 'overview' ? (
              <div className="row">
                <div className="col-md-8">
                  {portal.description && (
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>About this Campaign</h4>
                      <p style={{ fontSize: 14, lineHeight: 1.8, color: '#555' }}>{portal.description}</p>
                    </div>
                  )}

                  {categories.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                        Categories <small style={{ color: '#999' }}>({categories.length})</small>
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {categories.map(cat => (
                          <div key={cat.id} style={{
                            border: '1px solid #e7eaec', borderRadius: 4, padding: '8px 12px',
                            background: '#fafafa', minWidth: 120,
                          }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{cat.name}</div>
                            {cat.description && (
                              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{cat.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-4">
                  <div style={{ border: '1px solid #e7eaec', borderRadius: 4, overflow: 'hidden' }}>
                    {[
                      { label: 'Campaign ID', value: `#${portal.ideaId}` },
                      { label: 'Status', value: <span className={`label label-${isActive ? 'success' : 'default'}`}>{isActive ? 'Active' : 'Inactive'}</span> },
                      { label: 'Start Date', value: portal.startForm ? new Date(portal.startForm).toLocaleDateString() : '—' },
                      { label: 'End Date', value: portal.startEnd ? new Date(portal.startEnd).toLocaleDateString() : '—' },
                      { label: 'Max Team Size', value: portal.teamSize ?? '—' },
                      { label: 'Total Submissions', value: subs.length },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', padding: '10px 14px', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ width: 120, fontSize: 12, color: '#999', textTransform: 'uppercase', flexShrink: 0 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              subs.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: 40 }}>
                  <i className="fa fa-inbox fa-3x" style={{ marginBottom: 12 }} />
                  <p>No submissions yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Submitted On</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((s, i) => (
                        <tr key={s.id}>
                          <td style={{ color: '#999', fontSize: 12 }}>{i + 1}</td>
                          <td>
                            <strong>{s.title}</strong>
                            {s.shortDescription && (
                              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                                {s.shortDescription.slice(0, 80)}{s.shortDescription.length > 80 ? '…' : ''}
                              </div>
                            )}
                          </td>
                          <td>
                            {s.isGroup === '1'
                              ? <span className="label label-info">Group</span>
                              : <span className="label label-default">Individual</span>}
                          </td>
                          <td style={{ fontSize: 12, color: '#888' }}>
                            {s.createdOn ? new Date(s.createdOn).toLocaleDateString() : '—'}
                          </td>
                          <td>
                            <Link href={`/portal/idea/submissions/${s.id}`} className="btn btn-xs btn-white">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>

        <Link href="/portal/idea" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to Idea Portal
        </Link>
      </div>
    </>
  );
}
