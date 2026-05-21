'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface TaxDoc {
  id: number;
  title: string;
  documentName?: string;
  documentType?: string;
  sectionId?: number;
  createdAt?: string;
}

interface TaxFaq {
  id: number;
  question: string;
  answer: string;
}

interface TaxLink {
  id: number;
  title: string;
  link: string;
  linkType?: string;
}

interface TaxSection {
  id: number;
  name?: string;
  documents: TaxDoc[];
  hyperlinks: TaxLink[];
}

const DOC_TYPE_ICON: Record<string, string> = {
  pdf: 'fa-file-pdf-o', doc: 'fa-file-word-o', xls: 'fa-file-excel-o', ppt: 'fa-file-powerpoint-o',
};

export default function TaxPage() {
  const [sections, setSections] = useState<TaxSection[]>([]);
  const [docs, setDocs] = useState<TaxDoc[]>([]);
  const [faqs, setFaqs] = useState<TaxFaq[]>([]);
  const [links, setLinks] = useState<TaxLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'sections' | 'docs' | 'faqs' | 'links'>('sections');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [dash, d, l] = await Promise.all([
        apiFetch<{ sections: TaxSection[]; faqs: TaxFaq[] }>('/tax/dashboard').catch(() => null),
        apiFetch<TaxDoc[]>('/tax/documents').catch(() => []),
        apiFetch<TaxLink[]>('/tax/hyperlinks').catch(() => []),
      ]);
      setSections(Array.isArray(dash?.sections) ? dash!.sections : []);
      setFaqs(Array.isArray(dash?.faqs) ? dash!.faqs : []);
      setDocs(Array.isArray(d) ? d : []);
      setLinks(Array.isArray(l) ? l : []);
      // Fall back to the flat documents view if no sections configured.
      if (!dash?.sections?.length) setTab('docs');
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Tax Insight</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Tax Insight</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title">
            <ul className="nav nav-tabs" style={{ borderBottom: 'none', marginBottom: -1 }}>
              <li className={tab === 'sections' ? 'active' : ''}>
                <a href="#" onClick={e => { e.preventDefault(); setTab('sections'); }}>
                  Sections <span className="badge" style={{ background: '#aaa' }}>{sections.length}</span>
                </a>
              </li>
              <li className={tab === 'docs' ? 'active' : ''}>
                <a href="#" onClick={e => { e.preventDefault(); setTab('docs'); }}>
                  Documents <span className="badge" style={{ background: '#aaa' }}>{docs.length}</span>
                </a>
              </li>
              <li className={tab === 'faqs' ? 'active' : ''}>
                <a href="#" onClick={e => { e.preventDefault(); setTab('faqs'); }}>
                  FAQs <span className="badge" style={{ background: '#aaa' }}>{faqs.length}</span>
                </a>
              </li>
              <li className={tab === 'links' ? 'active' : ''}>
                <a href="#" onClick={e => { e.preventDefault(); setTab('links'); }}>
                  Useful Links <span className="badge" style={{ background: '#aaa' }}>{links.length}</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="ibox-content">
            {loading ? (
              <div className="text-center" style={{ padding: 40 }}>
                <i className="fa fa-spinner fa-spin fa-2x text-muted" />
              </div>
            ) : tab === 'sections' ? (
              sections.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: 40 }}>
                  No tax sections configured yet.
                </div>
              ) : (
                <div className="row">
                  {sections.map(sec => (
                    <div className="col-md-6" key={sec.id} style={{ marginBottom: 16 }}>
                      <div style={{ border: '1px solid #e7eaec', borderRadius: 4, padding: 14 }}>
                        <h4 style={{ marginTop: 0, fontSize: 15 }}>
                          <i className="fa fa-folder-open-o" style={{ color: '#e2231a', marginRight: 8 }} />
                          {sec.name}
                        </h4>
                        {sec.documents.length > 0 && (
                          <>
                            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.4, margin: '8px 0 4px' }}>
                              Documents
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {sec.documents.map(doc => (
                                <li key={doc.id} style={{ padding: '4px 0', fontSize: 13 }}>
                                  <i className={`fa ${DOC_TYPE_ICON[doc.documentType?.toLowerCase() ?? ''] ?? 'fa-file-o'}`}
                                    style={{ color: '#e2231a', marginRight: 6 }} />
                                  {doc.documentName ? (
                                    <a href={`/api/uploads/${doc.documentName}`} target="_blank" rel="noreferrer"
                                      style={{ color: '#1c84c6' }}>{doc.title}</a>
                                  ) : doc.title}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {sec.hyperlinks.length > 0 && (
                          <>
                            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.4, margin: '8px 0 4px' }}>
                              Useful Links
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {sec.hyperlinks.map(hl => (
                                <li key={hl.id} style={{ padding: '4px 0', fontSize: 13 }}>
                                  <i className="fa fa-external-link" style={{ color: '#1ab394', marginRight: 6 }} />
                                  <a href={hl.link} target="_blank" rel="noreferrer" style={{ color: '#1c84c6' }}>{hl.title}</a>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {!sec.documents.length && !sec.hyperlinks.length && (
                          <div style={{ color: '#aaa', fontSize: 12, fontStyle: 'italic' }}>
                            No content in this section yet.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : tab === 'docs' ? (
              docs.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: 40 }}>No documents available.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Added On</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map(d => (
                        <tr key={d.id}>
                          <td>
                            <i className={`fa ${DOC_TYPE_ICON[d.documentType?.toLowerCase() ?? ''] ?? 'fa-file-o'}`}
                              style={{ marginRight: 8, color: '#888' }} />
                            <strong>{d.title}</strong>
                          </td>
                          <td style={{ fontSize: 12 }}>
                            {d.documentType ? (
                              <span className="label label-default" style={{ textTransform: 'uppercase', fontSize: 10 }}>
                                {d.documentType}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={{ fontSize: 12, color: '#888' }}>
                            {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td>
                            {d.documentName && (
                              <a href={`/api/uploads/${d.documentName}`} target="_blank" rel="noreferrer"
                                className="btn btn-xs btn-primary">
                                <i className="fa fa-download" style={{ marginRight: 4 }} />Download
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : tab === 'faqs' ? (
              faqs.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: 40 }}>No FAQs available.</div>
              ) : (
                <div className="panel-group" id="faqAccordion">
                  {faqs.map((f, i) => (
                    <div key={f.id} className="panel panel-default" style={{ marginBottom: 4, border: '1px solid #e7eaec', borderRadius: 4 }}>
                      <div className="panel-heading" style={{ padding: '12px 16px', cursor: 'pointer', background: openFaq === f.id ? '#f8f9fa' : '#fff' }}
                        onClick={() => setOpenFaq(prev => prev === f.id ? null : f.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>
                            <span style={{ color: '#888', marginRight: 8 }}>Q{i + 1}.</span>
                            {f.question}
                          </span>
                          <i className={`fa fa-chevron-${openFaq === f.id ? 'up' : 'down'}`} style={{ color: '#888', fontSize: 12 }} />
                        </div>
                      </div>
                      {openFaq === f.id && (
                        <div className="panel-body" style={{ padding: '12px 16px', borderTop: '1px solid #e7eaec', fontSize: 14, lineHeight: 1.7 }}>
                          {f.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              links.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: 40 }}>No links available.</div>
              ) : (
                <div className="row">
                  {links.map(l => (
                    <div key={l.id} className="col-md-4 col-sm-6" style={{ marginBottom: 16 }}>
                      <a href={l.link} target="_blank" rel="noreferrer"
                        style={{ display: 'block', padding: '14px 16px', border: '1px solid #e7eaec', borderRadius: 4, textDecoration: 'none', color: 'inherit', background: '#fafafa', transition: 'box-shadow 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1c84c6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className="fa fa-external-link" style={{ color: '#fff', fontSize: 14 }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{l.title}</div>
                            {l.linkType && (
                              <div style={{ fontSize: 11, color: '#888', textTransform: 'capitalize' }}>{l.linkType}</div>
                            )}
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
