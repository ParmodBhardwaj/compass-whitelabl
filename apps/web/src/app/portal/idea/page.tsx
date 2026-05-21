'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Campaign {
  ideaId: number;
  title: string;
  description?: string;
  status?: string;
  startForm?: string;
  startEnd?: string;
  teamSize?: number;
  createdAt?: string;
}

const STATUS_COLOR: Record<string, string> = {
  '1': 'success',
  '0': 'default',
  active: 'success',
  inactive: 'default',
};

export default function IdeaPortalPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'all'>('active');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (tab === 'active') {
          const data = await apiFetch<Campaign[]>('/idea/campaigns/active');
          setCampaigns(data);
        } else {
          const data = await apiFetch<Campaign[]>('/idea/campaigns');
          setCampaigns(data);
        }
      } catch {}
      setLoading(false);
    })();
  }, [tab]);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const isActive = (c: Campaign) => {
    if (c.status !== '1') return false;
    const today = new Date().toISOString().slice(0, 10);
    return (!c.startForm || c.startForm <= today) && (!c.startEnd || c.startEnd >= today);
  };

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Idea Portal</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Idea Portal</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Link href="/portal/idea/submit" className="btn btn-primary btn-sm">
            <i className="fa fa-plus" style={{ marginRight: 4 }} />Submit Idea
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              {(['active', 'all'] as const).map(t => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}
                    style={{ textTransform: 'capitalize' }}>{t === 'active' ? 'Active Campaigns' : 'All Campaigns'}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 40 }}>
                <i className="fa fa-lightbulb-o fa-3x" style={{ marginBottom: 12 }} />
                <p>No {tab === 'active' ? 'active' : ''} campaigns found.</p>
              </div>
            ) : (
              <div className="row">
                {campaigns.map(c => (
                  <div key={c.ideaId} className="col-md-4 col-sm-6" style={{ marginBottom: 20 }}>
                    <div className="ibox" style={{ border: '1px solid #e7eaec', borderRadius: 4, marginBottom: 0 }}>
                      {/* Header band */}
                      <div style={{
                        background: isActive(c) ? '#1ab394' : '#b0b0b0',
                        padding: '10px 14px',
                        borderRadius: '4px 4px 0 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{c.title}</span>
                        <span className={`label label-${STATUS_COLOR[c.status ?? '0'] ?? 'default'}`} style={{ fontSize: 10 }}>
                          {c.status === '1' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="ibox-content" style={{ padding: '12px 14px' }}>
                        {c.description && (
                          <p style={{ fontSize: 13, color: '#555', marginBottom: 10, lineHeight: 1.6 }}>
                            {c.description.length > 120 ? c.description.slice(0, 120) + '…' : c.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888', marginBottom: 10 }}>
                          <div><i className="fa fa-calendar" style={{ marginRight: 4 }} />Start: {formatDate(c.startForm)}</div>
                          <div><i className="fa fa-calendar-check-o" style={{ marginRight: 4 }} />End: {formatDate(c.startEnd)}</div>
                        </div>
                        {c.teamSize && (
                          <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
                            <i className="fa fa-users" style={{ marginRight: 4 }} />Max team size: {c.teamSize}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <Link href={`/portal/idea/campaigns/${c.ideaId}`}
                            className="btn btn-xs btn-white">
                            <i className="fa fa-eye" style={{ marginRight: 4 }} />View
                          </Link>
                          {isActive(c) && (
                            <Link href={`/portal/idea/submit?campaignId=${c.ideaId}`}
                              className="btn btn-xs btn-primary">
                              <i className="fa fa-lightbulb-o" style={{ marginRight: 4 }} />Submit Idea
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My submissions quick-link */}
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <h5 style={{ margin: 0 }}>My Submissions</h5>
            <div className="ibox-tools">
              <Link href="/portal/idea/my-submissions" className="btn btn-xs btn-white">
                View All
              </Link>
            </div>
          </div>
          <div className="ibox-content">
            <MySubmissionsSummary />
          </div>
        </div>
      </div>
    </>
  );
}

function MySubmissionsSummary() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<{ id: number }>('/auth/me');
        const data = await apiFetch<any[]>(`/idea/submissions?submittedBy=${me.id}`);
        setSubs(data.slice(0, 5));
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center" style={{ padding: 20 }}><i className="fa fa-spinner fa-spin text-muted" /></div>;
  if (!subs.length) return <p className="text-muted" style={{ margin: 0 }}>You have not submitted any ideas yet.</p>;

  return (
    <div className="table-responsive">
      <table className="table table-hover table-condensed" style={{ marginBottom: 0 }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Campaign</th>
            <th>Submitted On</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {subs.map(s => (
            <tr key={s.id}>
              <td style={{ fontWeight: 500 }}>{s.title}</td>
              <td><span className="label label-default">#{s.ideaId}</span></td>
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
  );
}
