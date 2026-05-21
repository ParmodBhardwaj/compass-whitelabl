'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface SopSection {
  id: number;
  name?: string;
  type?: string;
  sortOrder?: number;
}

interface SopProcess {
  id: number;
  title?: string;
  alias?: string;
  description?: string;
  sectionId?: number;
  sortOrder?: number;
  implementationDate?: string;
  revisedDate?: string;
  revisionNumber?: number;
  isPublic?: string;
}

export default function SopPortalPage() {
  const [sections, setSections] = useState<SopSection[]>([]);
  const [processes, setProcesses] = useState<SopProcess[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<SopSection[]>('/sop/sections'),
      apiFetch<SopProcess[]>('/sop/processes'),
    ]).then(([secs, procs]) => {
      setSections(secs);
      setProcesses(procs);
      if (secs.length > 0) setSelectedSection(secs[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return processes.filter(p => {
      const matchSection = selectedSection === null || p.sectionId === selectedSection;
      const matchSearch = !search.trim() || (p.title ?? '').toLowerCase().includes(search.toLowerCase());
      return matchSection && matchSearch;
    });
  }, [processes, selectedSection, search]);

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Standard Operating Procedures</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>SOP</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {loading ? (
          <div className="ibox"><div className="ibox-content text-center" style={{ padding: 40 }}>
            <i className="fa fa-spinner fa-spin fa-2x text-muted" />
          </div></div>
        ) : (
          <div className="row">
            {/* Left: Sections sidebar */}
            <div className="col-lg-3 col-md-4">
              <div className="ibox float-e-margins">
                <div className="ibox-title">
                  <h5 style={{ margin: 0 }}>Sections</h5>
                </div>
                <div className="ibox-content" style={{ padding: 0 }}>
                  <ul className="nav nav-pills nav-stacked" style={{ margin: 0 }}>
                    <li
                      className={selectedSection === null ? 'active' : ''}
                      style={{ borderBottom: '1px solid #f5f5f5' }}
                    >
                      <a
                        href="#"
                        onClick={e => { e.preventDefault(); setSelectedSection(null); }}
                        style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span>All Sections</span>
                        <span className="badge">{processes.length}</span>
                      </a>
                    </li>
                    {sections.map(s => {
                      const count = processes.filter(p => p.sectionId === s.id).length;
                      return (
                        <li
                          key={s.id}
                          className={selectedSection === s.id ? 'active' : ''}
                          style={{ borderBottom: '1px solid #f5f5f5' }}
                        >
                          <a
                            href="#"
                            onClick={e => { e.preventDefault(); setSelectedSection(s.id); }}
                            style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <span>{s.name}</span>
                            {count > 0 && <span className="badge">{count}</span>}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: Processes list */}
            <div className="col-lg-9 col-md-8">
              <div className="ibox float-e-margins">
                <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h5 style={{ margin: 0 }}>
                    {selectedSection === null
                      ? 'All SOPs'
                      : sections.find(s => s.id === selectedSection)?.name ?? 'SOPs'
                    }
                    <small style={{ marginLeft: 8, color: '#999' }}>({filtered.length})</small>
                  </h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ margin: 0, fontSize: 13 }}>Search:</label>
                    <input
                      className="form-control input-sm"
                      style={{ width: 200 }}
                      placeholder="Search SOPs..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="ibox-content" style={{ padding: 0 }}>
                  {filtered.length === 0 ? (
                    <p className="text-center text-muted" style={{ padding: 40 }}>No SOPs found.</p>
                  ) : (
                    <table className="table table-hover" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th style={{ width: 130 }}>Implementation</th>
                          <th style={{ width: 80, textAlign: 'center' }}>Rev.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((p, idx) => (
                          <tr key={p.id}>
                            <td style={{ verticalAlign: 'middle', color: '#999', width: 40 }}>{idx + 1}</td>
                            <td style={{ verticalAlign: 'middle' }}>
                              <Link
                                href={`/portal/sop/${p.id}`}
                                style={{ fontWeight: 600, color: '#337ab7' }}
                              >
                                {p.title}
                              </Link>
                              {p.description && (
                                <p style={{ fontSize: 12, color: '#999', margin: '3px 0 0', lineHeight: 1.4 }}>
                                  {p.description.replace(/<[^>]+>/g, '').slice(0, 100)}
                                </p>
                              )}
                            </td>
                            <td style={{ verticalAlign: 'middle', fontSize: 13 }}>
                              {p.implementationDate && (
                                <span>
                                  <i className="fa fa-calendar" style={{ marginRight: 4, color: '#aaa' }} />
                                  {p.implementationDate}
                                </span>
                              )}
                            </td>
                            <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                              {p.revisionNumber != null && (
                                <span className="label label-default">Rev {p.revisionNumber}</span>
                              )}
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
        )}
      </div>
    </>
  );
}
