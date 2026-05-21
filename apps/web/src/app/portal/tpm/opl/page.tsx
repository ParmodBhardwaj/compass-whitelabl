'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface OplItem {
  id: number;
  oplNo?: string;
  description?: string;
  status?: string;
  isDraft?: string;
  plantId?: number;
  pillarId?: number;
  topicId?: number;
  type?: string;
  classificationType?: string;
  firstPhoto?: string;
  createdAt?: string;
  createdBy?: number;
}

interface MetaItem { id: number; title?: string; name?: string; pillarName?: string; }

type TabFilter = 'my' | 'all' | 'approved';

const STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  revision: 'info',
};

export default function OplListPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [rows, setRows] = useState<OplItem[]>([]);
  const [plants, setPlants] = useState<MetaItem[]>([]);
  const [pillars, setPillars] = useState<MetaItem[]>([]);
  const [tab, setTab] = useState<TabFilter>('my');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<{ id: number }>('/auth/me');
        setUserId(me.id);
        const [plantList, pillarList, myOpls] = await Promise.all([
          apiFetch<MetaItem[]>('/tpm/meta/plants'),
          apiFetch<MetaItem[]>('/tpm/meta/opl-pillars'),
          apiFetch<OplItem[]>(`/tpm/opl?userId=${me.id}`),
        ]);
        setPlants(Array.isArray(plantList) ? plantList : []);
        setPillars(Array.isArray(pillarList) ? pillarList : []);
        setRows(Array.isArray(myOpls) ? myOpls : []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (userId === null) return;
    setLoading(true);
    let url = `/tpm/opl?userId=${userId}`;
    if (tab === 'all') url = '/tpm/opl?all=1';
    else if (tab === 'approved') url = '/tpm/opl?all=1&status=approved&isDraft=0';
    apiFetch<OplItem[]>(url)
      .then(d => setRows(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, userId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      (r.description ?? '').toLowerCase().includes(q) ||
      (r.oplNo ?? '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  async function submitOpl(id: number) {
    await apiFetch(`/tpm/opl/${id}/submit`, { method: 'POST' });
    const updated = await apiFetch<OplItem[]>(`/tpm/opl?userId=${userId}`);
    setRows(Array.isArray(updated) ? updated : []);
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>OPL — One Point Lessons</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/tpm">TPM</Link></li>
            <li className="active"><strong>OPL</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Link href="/portal/tpm/opl/new" className="btn btn-primary btn-sm">
            <i className="fa fa-plus" style={{ marginRight: 4 }} />New OPL
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ margin: 0 }}>OPL Cards</h5>
            <input
              className="form-control input-sm"
              style={{ width: 220 }}
              placeholder="Search OPLs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="ibox-content">
            <ul className="nav nav-tabs" style={{ marginBottom: 16 }}>
              {([['my', 'My OPLs'], ['all', 'All'], ['approved', 'Approved']] as [TabFilter, string][]).map(([t, label]) => (
                <li key={t} className={tab === t ? 'active' : ''}>
                  <a href="#" onClick={e => { e.preventDefault(); setTab(t); }}>{label}</a>
                </li>
              ))}
            </ul>

            {loading ? (
              <div className="text-center" style={{ padding: 40 }}><i className="fa fa-spinner fa-spin fa-2x text-muted" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted" style={{ padding: 30 }}>No OPL cards found.</p>
            ) : (
              <div className="row">
                {filtered.map(opl => {
                  const st = opl.isDraft === '1' ? 'draft' : (opl.status ?? 'draft');
                  const stCls = STATUS_COLOR[st] ?? 'default';
                  return (
                    <div key={opl.id} className="col-lg-4 col-md-6" style={{ marginBottom: 16 }}>
                      <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
                        {opl.firstPhoto && (
                          <div style={{ height: 140, overflow: 'hidden', borderRadius: '4px 4px 0 0', background: '#f5f5f5' }}>
                            <img
                              src={`/api/uploads/${opl.firstPhoto}`}
                              alt="OPL before"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div className="ibox-content" style={{ padding: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              {opl.oplNo && <code style={{ fontSize: 11, color: '#888' }}>{opl.oplNo}</code>}
                              {opl.type && <span className="label label-info" style={{ marginLeft: 4, fontSize: 10 }}>{opl.type}</span>}
                            </div>
                            <span className={`label label-${stCls}`} style={{ fontSize: 10, textTransform: 'capitalize' }}>{st}</span>
                          </div>
                          <p style={{ fontSize: 13, color: '#555', marginBottom: 12, lineHeight: 1.6 }}>
                            {(opl.description ?? '').slice(0, 100)}{(opl.description?.length ?? 0) > 100 ? '…' : ''}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: '#aaa' }}>
                              {opl.createdAt ? new Date(opl.createdAt).toLocaleDateString() : ''}
                            </span>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {opl.isDraft === '1' && opl.createdBy === userId && (
                                <button className="btn btn-xs btn-warning" onClick={() => submitOpl(opl.id)}>
                                  <i className="fa fa-paper-plane" style={{ marginRight: 3 }} />Submit
                                </button>
                              )}
                              <Link href={`/portal/tpm/opl/${opl.id}`} className="btn btn-xs btn-primary">
                                <i className="fa fa-eye" style={{ marginRight: 3 }} />View
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
