'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Policy {
  id: number;
  title?: string;
  alias?: string;
  shortDescription?: string;
  isPublic?: '0' | '1';
  status?: '0' | '1';
}

export default function PolicyListPage() {
  const [items, setItems] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch<Policy[]>('/policies')
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item =>
    !search.trim() ||
    (item.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (item.alias ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Policy</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Policy</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-lg-10 col-lg-offset-1">
            <div className="ibox float-e-margins">
              <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h5 style={{ margin: 0 }}>Policy Documents</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ margin: 0, fontSize: 13 }}>Search:</label>
                  <input
                    className="form-control input-sm"
                    style={{ width: 200 }}
                    placeholder="Search policies..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="ibox-content">
                {loading ? (
                  <div className="text-center" style={{ padding: 40 }}>
                    <i className="fa fa-spinner fa-spin fa-2x text-muted" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-center text-muted" style={{ padding: 40 }}>No policy documents available.</p>
                ) : (
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Policy</th>
                        <th style={{ width: 90, textAlign: 'center' }}>Visibility</th>
                        <th style={{ width: 100 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, idx) => (
                        <tr key={item.id}>
                          <td style={{ verticalAlign: 'middle', color: '#999' }}>{idx + 1}</td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <Link
                              href={`/portal/policy/${item.id}`}
                              style={{ fontWeight: 600, color: '#337ab7' }}
                            >
                              {item.title}
                            </Link>
                            {item.shortDescription && (
                              <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0' }}>{item.shortDescription}</p>
                            )}
                          </td>
                          <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                            {item.isPublic === '1' ? (
                              <span className="label label-primary">Public</span>
                            ) : (
                              <span className="label label-default">Restricted</span>
                            )}
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <Link href={`/portal/policy/${item.id}`} className="btn btn-xs btn-primary">
                              <i className="fa fa-eye" style={{ marginRight: 4 }} />View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
