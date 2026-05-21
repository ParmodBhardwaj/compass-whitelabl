'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface Policy {
  id: number;
  title?: string;
  alias?: string;
  shortDescription?: string;
  description?: string;
  isPublic?: '0' | '1';
  status?: '0' | '1';
}

interface Section {
  id: number;
  sectionNo?: string;
  title?: string;
  description?: string;
  isActive?: '0' | '1';
}

interface PolicyDetail {
  policy: Policy;
  sections: Section[];
}

export default function PolicyDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<PolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<PolicyDetail>(`/policies/${params.id}`)
      .then(d => {
        setData(d);
        const first = d.sections?.find(s => s.isActive !== '0');
        if (first) setOpen(first.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox"><div className="ibox-content text-center" style={{ padding: 40 }}>
          <i className="fa fa-spinner fa-spin fa-2x text-muted" />
        </div></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="alert alert-danger">Policy not found or access denied.</div>
        <Link href="/portal/policy" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back
        </Link>
      </div>
    );
  }

  const { policy, sections } = data;
  const activeSections = sections.filter(s => s.isActive !== '0');

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{policy.title}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/policy">Policy</Link></li>
            <li className="active"><strong>{policy.title}</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-lg-10 col-lg-offset-1">

            {/* Policy overview */}
            {(policy.shortDescription || policy.description) && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>Overview</h5>
                </div>
                <div className="ibox-content">
                  {policy.shortDescription && (
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#555', marginBottom: 12 }}>
                      {policy.shortDescription}
                    </p>
                  )}
                  {policy.description && (
                    <div
                      style={{ fontSize: 14, lineHeight: 1.8 }}
                      dangerouslySetInnerHTML={{ __html: policy.description }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Sections accordion */}
            {activeSections.length > 0 && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>
                    Sections <small style={{ marginLeft: 6, color: '#999' }}>({activeSections.length})</small>
                  </h5>
                </div>
                <div className="ibox-content" style={{ padding: 0 }}>
                  {activeSections.map(s => (
                    <div key={s.id} style={{ borderBottom: '1px solid #e7eaec' }}>
                      {/* Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 20px',
                          cursor: 'pointer',
                          background: open === s.id ? '#f5f5f5' : 'white',
                          userSelect: 'none',
                        }}
                        onClick={() => setOpen(prev => prev === s.id ? null : s.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {s.sectionNo && (
                            <span style={{
                              background: '#1ab394', color: 'white', borderRadius: 3,
                              padding: '2px 8px', fontSize: 12, fontWeight: 600,
                              minWidth: 36, textAlign: 'center',
                            }}>
                              {s.sectionNo}
                            </span>
                          )}
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</span>
                        </div>
                        <i className={`fa fa-chevron-${open === s.id ? 'up' : 'down'}`} style={{ color: '#aaa' }} />
                      </div>
                      {/* Body */}
                      {open === s.id && (
                        s.description ? (
                          <div
                            style={{ padding: '16px 20px', fontSize: 14, lineHeight: 1.8, background: 'white' }}
                            dangerouslySetInnerHTML={{ __html: s.description }}
                          />
                        ) : (
                          <div style={{ padding: '16px 20px', color: '#999', fontSize: 13 }}>
                            No content for this section.
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link href="/portal/policy" className="btn btn-white btn-sm">
              <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to Policies
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
