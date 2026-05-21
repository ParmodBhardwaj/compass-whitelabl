'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/auth';

interface Document {
  id: number;
  title?: string;
  documentName?: string;
  documentType?: string;
  sectionId?: number;
  status?: string;
  createdAt?: string;
}

interface Faq {
  id: number;
  question?: string;
  answer?: string;
}

interface Hyperlink {
  id: number;
  title?: string;
  link?: string;
  linkType?: string;
  sectionId?: number;
}

interface Section {
  id: number;
  name?: string;
  hyperlinks: Hyperlink[];
  documents: Document[];
}

type Tab = 'sections' | 'documents' | 'faqs' | 'links';

export default function InsurancePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [links, setLinks] = useState<Hyperlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('sections');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      // Sectioned landing (legacy `HomeController` shape) — sections + top
      // N docs/links per + FAQs
      apiFetch<{ sections: Section[]; faqs: Faq[] }>('/insurance/dashboard').catch(() => null),
      // Flat lists for the per-tab views
      apiFetch<Document[]>('/insurance/documents').catch(() => []),
      apiFetch<Hyperlink[]>('/insurance/hyperlinks').catch(() => []),
    ]).then(([dash, d, l]) => {
      setSections(Array.isArray(dash?.sections) ? dash!.sections : []);
      setFaqs(Array.isArray(dash?.faqs) ? dash!.faqs : []);
      setDocuments(Array.isArray(d) ? d : []);
      setLinks(Array.isArray(l) ? l : []);
      // If no sections configured, default to flat documents tab so the
      // page isn't empty for portals that haven't seeded sections yet.
      if (!dash?.sections?.length) setActiveTab('documents');
      setLoading(false);
    });
  }, []);

  const tabs: Array<{ key: Tab; label: string; icon: string; count: number }> = [
    { key: 'sections',  label: 'Sections',     icon: 'fa-th-large',        count: sections.length },
    { key: 'documents', label: 'Documents',    icon: 'fa-file-pdf-o',      count: documents.length },
    { key: 'faqs',      label: 'FAQs',         icon: 'fa-question-circle', count: faqs.length },
    { key: 'links',     label: 'Useful Links', icon: 'fa-link',            count: links.length },
  ];

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <i className="fa fa-spinner fa-spin" style={{ fontSize: 28, color: '#e2231a' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      {/* Header */}
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title">
              <h5>
                <i className="fa fa-heartbeat" style={{ marginRight: 8, color: '#e2231a' }} />
                Insurance Portal
              </h5>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-content" style={{ padding: '0 20px' }}>
              <ul style={{
                display: 'flex', listStyle: 'none', padding: 0, margin: 0,
                borderBottom: '2px solid #e5e5e5',
              }}>
                {tabs.map(t => (
                  <li key={t.key}>
                    <button
                      onClick={() => setActiveTab(t.key)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '14px 20px', fontSize: 13, fontWeight: 600,
                        color: activeTab === t.key ? '#e2231a' : '#676a6c',
                        borderBottom: activeTab === t.key ? '2px solid #e2231a' : '2px solid transparent',
                        marginBottom: -2,
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <i className={`fa ${t.icon}`} />
                      {t.label}
                      <span style={{
                        background: activeTab === t.key ? '#e2231a' : '#f4f4f4',
                        color: activeTab === t.key ? '#fff' : '#888',
                        borderRadius: 10, padding: '0 7px', fontSize: 11,
                      }}>
                        {t.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sections tab — sectioned dashboard (matches legacy HomeController) */}
      {activeTab === 'sections' && (
        <div className="row">
          {sections.length === 0 ? (
            <div className="col-lg-12"><EmptyState icon="fa-th-large" text="No insurance sections configured yet." /></div>
          ) : sections.map(sec => (
            <div className="col-md-6" key={sec.id}>
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>
                    <i className="fa fa-folder-open-o" style={{ color: '#e2231a', marginRight: 8 }} />
                    {sec.name}
                  </h5>
                </div>
                <div className="ibox-content">
                  {/* Top documents */}
                  {sec.documents.length > 0 && (
                    <>
                      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
                        Documents
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px' }}>
                        {sec.documents.map(doc => (
                          <li key={doc.id} style={{ padding: '4px 0', fontSize: 13 }}>
                            <i className="fa fa-file-pdf-o" style={{ color: '#e2231a', marginRight: 6 }} />
                            <a href={`/files/insurance/${doc.documentName}`}
                              target="_blank" rel="noreferrer"
                              style={{ color: '#1c84c6' }}>
                              {doc.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {/* Top hyperlinks */}
                  {sec.hyperlinks.length > 0 && (
                    <>
                      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
                        Useful Links
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {sec.hyperlinks.map(hl => (
                          <li key={hl.id} style={{ padding: '4px 0', fontSize: 13 }}>
                            <i className="fa fa-external-link" style={{ color: '#1ab394', marginRight: 6 }} />
                            <a href={hl.link} target="_blank" rel="noreferrer" style={{ color: '#1c84c6' }}>
                              {hl.title}
                            </a>
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
            </div>
          ))}
        </div>
      )}

      {/* Documents tab */}
      {activeTab === 'documents' && (
        <div className="row">
          <div className="col-lg-12">
            {documents.length === 0 ? (
              <EmptyState icon="fa-file-pdf-o" text="No documents available." />
            ) : (
              <div className="ibox float-e-margins">
                <div className="ibox-content" style={{ padding: 0 }}>
                  <div className="table-responsive">
                    <table className="table table-hover" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                          <th style={{ padding: '10px 20px' }}>Title</th>
                          <th style={{ padding: '10px 20px' }}>Type</th>
                          <th style={{ padding: '10px 20px', width: 120 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map(doc => (
                          <tr key={doc.id}>
                            <td style={{ padding: '10px 20px', verticalAlign: 'middle' }}>
                              <i className="fa fa-file-pdf-o" style={{ color: '#e2231a', marginRight: 10 }} />
                              {doc.title}
                            </td>
                            <td style={{ padding: '10px 20px', verticalAlign: 'middle' }}>
                              <span style={{
                                background: '#f4f4f4', borderRadius: 3,
                                padding: '2px 8px', fontSize: 12, color: '#555',
                              }}>
                                {doc.documentType ?? '—'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 20px', verticalAlign: 'middle' }}>
                              {doc.documentName && (
                                <a
                                  href={`/files/insurance/${doc.documentName}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-xs btn-primary"
                                  style={{ background: '#e2231a', borderColor: '#e2231a', color: '#fff', borderRadius: 3, padding: '3px 10px', fontSize: 12 }}
                                >
                                  <i className="fa fa-download" style={{ marginRight: 5 }} />
                                  Download
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQs tab */}
      {activeTab === 'faqs' && (
        <div className="row">
          <div className="col-lg-12">
            {faqs.length === 0 ? (
              <EmptyState icon="fa-question-circle" text="No FAQs available." />
            ) : (
              faqs.map(faq => (
                <div className="ibox float-e-margins" key={faq.id}>
                  <div
                    className="ibox-title"
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                  >
                    <h5 style={{ margin: 0, fontSize: 14 }}>
                      <i className="fa fa-question-circle" style={{ color: '#1c84c6', marginRight: 10 }} />
                      {faq.question}
                    </h5>
                    <i className={`fa fa-chevron-${openFaqId === faq.id ? 'up' : 'down'}`} style={{ color: '#aaa', fontSize: 12 }} />
                  </div>
                  {openFaqId === faq.id && (
                    <div
                      className="ibox-content"
                      style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: faq.answer ?? '' }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Links tab */}
      {activeTab === 'links' && (
        <div className="row">
          <div className="col-lg-12">
            {links.length === 0 ? (
              <EmptyState icon="fa-link" text="No links available." />
            ) : (
              <div className="ibox float-e-margins">
                <div className="ibox-content" style={{ padding: 0 }}>
                  {links.map(l => (
                    <a
                      key={l.id}
                      href={l.link ?? '#'}
                      target={l.linkType === 'external' ? '_blank' : undefined}
                      rel={l.linkType === 'external' ? 'noreferrer' : undefined}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 20px',
                        borderBottom: '1px solid #f4f4f4',
                        textDecoration: 'none', color: 'inherit',
                      }}
                    >
                      <i className={`fa ${l.linkType === 'external' ? 'fa-external-link' : 'fa-link'}`}
                         style={{ color: '#1c84c6', fontSize: 14, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{l.title}</div>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2, wordBreak: 'break-all' }}>
                          {l.link}
                        </div>
                      </div>
                      <i className="fa fa-chevron-right" style={{ color: '#ccc', fontSize: 11 }} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="ibox float-e-margins">
      <div className="ibox-content" style={{ textAlign: 'center', padding: '50px 0', color: '#aaa' }}>
        <i className={`fa ${icon}`} style={{ fontSize: 36, display: 'block', marginBottom: 14 }} />
        <p style={{ margin: 0, fontSize: 14 }}>{text}</p>
      </div>
    </div>
  );
}
