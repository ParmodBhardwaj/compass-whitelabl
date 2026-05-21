'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface SopProcess {
  id: number;
  title?: string;
  description?: string;
  sectionId?: number;
  implementationDate?: string;
  revisedDate?: string;
  revisionNumber?: number;
  isPublic?: string;
}

interface SopProcedure {
  id: number;
  processId?: number;
  title?: string;
  sopNumber?: string;
  shortDescription?: string;
  level2File?: string;
  level2Title?: string;
  level3File?: string;
  level3Title?: string;
  level4File?: string;
  level4Title?: string;
  fromDate?: string;
}

interface SopLevel1 {
  id: number;
  title?: string;
  levelOneFile?: string;
}

interface SopLevel4File {
  id: number;
  procedureId?: number;
  fileTitle?: string;
  fileName?: string;
}

interface SopDetail {
  process: SopProcess;
  procedures: SopProcedure[];
  level1: SopLevel1[];
}

function FileLink({ file, label }: { file?: string; label?: string }) {
  if (!file) return null;
  const name = label || file.split('/').pop() || 'File';
  return (
    <a
      href={file.startsWith('http') ? file : `/uploads/sop/${file}`}
      target="_blank"
      rel="noreferrer"
      className="btn btn-xs btn-default"
      style={{ marginRight: 4, marginBottom: 4 }}
    >
      <i className="fa fa-file-pdf-o" style={{ marginRight: 4, color: '#e74c3c' }} />
      {name}
    </a>
  );
}

export default function SopProcessDetail() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<SopDetail | null>(null);
  const [level4, setLevel4] = useState<Record<number, SopLevel4File[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeProcedure, setActiveProcedure] = useState<number | null>(null);

  useEffect(() => {
    if (!params.id) return;
    apiFetch<SopDetail>(`/sop/processes/${params.id}`)
      .then(d => {
        setData(d);
        // log activity
        apiFetch(`/sop/activity`, {
          method: 'POST',
          body: JSON.stringify({ kind: 'view_listing', detail: String(params.id) }),
        }).catch(() => {});
        // fetch level4 files for each procedure
        if (d.procedures?.length) {
          const fetchAll = d.procedures.map(p =>
            apiFetch<SopLevel4File[]>(`/sop/procedures/${p.id}/files`)
              .then(files => ({ id: p.id, files }))
              .catch(() => ({ id: p.id, files: [] }))
          );
          Promise.all(fetchAll).then(results => {
            const map: Record<number, SopLevel4File[]> = {};
            results.forEach(r => { map[r.id] = r.files; });
            setLevel4(map);
          });
          setActiveProcedure(d.procedures[0]?.id ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
        <div className="alert alert-danger">SOP not found or access denied.</div>
        <Link href="/portal/sop" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to SOP
        </Link>
      </div>
    );
  }

  const { process, procedures, level1 } = data;

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{process.title}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/sop">SOP</Link></li>
            <li className="active"><strong>{process.title}</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-lg-12">

            {/* Process Info */}
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>{process.title}</h5>
              </div>
              <div className="ibox-content">
                <div className="row" style={{ marginBottom: process.description ? 16 : 0 }}>
                  {process.implementationDate && (
                    <div className="col-sm-4">
                      <strong>Implementation Date:</strong>
                      <span style={{ marginLeft: 8 }}>{process.implementationDate}</span>
                    </div>
                  )}
                  {process.revisedDate && (
                    <div className="col-sm-4">
                      <strong>Revised Date:</strong>
                      <span style={{ marginLeft: 8 }}>{process.revisedDate}</span>
                    </div>
                  )}
                  {process.revisionNumber != null && (
                    <div className="col-sm-4">
                      <strong>Revision:</strong>
                      <span className="label label-default" style={{ marginLeft: 8 }}>Rev {process.revisionNumber}</span>
                    </div>
                  )}
                </div>
                {process.description && (
                  <div
                    style={{ fontSize: 14, lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: process.description }}
                  />
                )}
              </div>
            </div>

            {/* Level 1 Files */}
            {level1.length > 0 && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>
                    <i className="fa fa-sitemap" style={{ marginRight: 6 }} />Level 1 — Organization Chart
                  </h5>
                </div>
                <div className="ibox-content">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {level1.map(f => (
                      <FileLink key={f.id} file={f.levelOneFile} label={f.title} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Procedures (tabs) */}
            {procedures.length > 0 && (
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>
                    <i className="fa fa-file-text-o" style={{ marginRight: 6 }} />Procedures ({procedures.length})
                  </h5>
                </div>
                <div className="ibox-content">
                  {/* Procedure tabs */}
                  <ul className="nav nav-tabs" style={{ marginBottom: 16 }}>
                    {procedures.map(p => (
                      <li key={p.id} className={activeProcedure === p.id ? 'active' : ''}>
                        <a
                          href="#"
                          onClick={e => { e.preventDefault(); setActiveProcedure(p.id); }}
                        >
                          {p.sopNumber ? `${p.sopNumber}` : p.title ?? `Procedure ${p.id}`}
                          {p.fromDate && <small style={{ marginLeft: 6, opacity: 0.7 }}>({p.fromDate})</small>}
                        </a>
                      </li>
                    ))}
                  </ul>

                  {/* Active procedure content */}
                  {procedures.filter(p => p.id === activeProcedure).map(p => (
                    <div key={p.id}>
                      {p.title && <h4 style={{ marginTop: 0 }}>{p.title}</h4>}
                      {p.shortDescription && (
                        <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>{p.shortDescription}</p>
                      )}

                      <div className="row">
                        {/* Level 2 */}
                        {p.level2File && (
                          <div className="col-sm-6 col-md-3" style={{ marginBottom: 12 }}>
                            <div style={{ background: '#f9f9f9', border: '1px solid #e5e6e7', borderRadius: 4, padding: 12, textAlign: 'center' }}>
                              <i className="fa fa-file-text fa-2x" style={{ color: '#1c84c6', marginBottom: 8, display: 'block' }} />
                              <strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Level 2</strong>
                              <p style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{p.level2Title || 'SOP Document'}</p>
                              <a
                                href={p.level2File.startsWith('http') ? p.level2File : `/uploads/sop/${p.level2File}`}
                                target="_blank" rel="noreferrer"
                                className="btn btn-xs btn-primary"
                              >
                                <i className="fa fa-download" style={{ marginRight: 4 }} />Download
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Level 3 */}
                        {p.level3File && (
                          <div className="col-sm-6 col-md-3" style={{ marginBottom: 12 }}>
                            <div style={{ background: '#f9f9f9', border: '1px solid #e5e6e7', borderRadius: 4, padding: 12, textAlign: 'center' }}>
                              <i className="fa fa-file-excel-o fa-2x" style={{ color: '#1ab394', marginBottom: 8, display: 'block' }} />
                              <strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Level 3</strong>
                              <p style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{p.level3Title || 'Flow Chart'}</p>
                              <a
                                href={p.level3File.startsWith('http') ? p.level3File : `/uploads/sop/${p.level3File}`}
                                target="_blank" rel="noreferrer"
                                className="btn btn-xs btn-success"
                              >
                                <i className="fa fa-download" style={{ marginRight: 4 }} />Download
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Level 4 files */}
                        {(level4[p.id] ?? []).length > 0 && (
                          <div className="col-sm-12 col-md-6" style={{ marginBottom: 12 }}>
                            <div style={{ background: '#f9f9f9', border: '1px solid #e5e6e7', borderRadius: 4, padding: 12 }}>
                              <strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Level 4 — Templates &amp; Forms</strong>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {(level4[p.id] ?? []).map(f => (
                                  <a
                                    key={f.id}
                                    href={f.fileName?.startsWith('http') ? f.fileName : `/uploads/sop/${f.fileName}`}
                                    target="_blank" rel="noreferrer"
                                    className="btn btn-xs btn-default"
                                  >
                                    <i className="fa fa-file-o" style={{ marginRight: 4 }} />
                                    {f.fileTitle || f.fileName}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link href="/portal/sop" className="btn btn-white btn-sm">
              <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to SOP
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
