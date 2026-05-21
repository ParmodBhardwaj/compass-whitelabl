'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/auth';
import { AdminDataTable, StatusBadge } from '@/components/admin/AdminDataTable';
import { RichEditor } from '@/components/admin/RichEditor';

interface PolicyRow {
  id?: number;
  title: string;
  alias?: string;
  shortDescription?: string;
  description?: string;
  isPublic: '0' | '1';
  status: '0' | '1';
  store?: number;
  fromDate?: string;  // legacy `from_date string NULL` — effective-from date
}

interface Section {
  id?: number;
  policyId?: number;
  sectionNo?: string;
  title?: string;
  description?: string;
  isActive: '0' | '1';
}

type View = 'list' | 'add' | 'edit';
type SectionView = 'none' | 'add' | 'edit';

const BLANK_POLICY: PolicyRow = {
  title: '', alias: '', shortDescription: '', description: '',
  isPublic: '1', status: '1', fromDate: '',
};

const BLANK_SECTION: Section = {
  sectionNo: '', title: '', description: '', isActive: '1',
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function PolicyAdmin() {
  const [view, setView] = useState<View>('list');
  const [rows, setRows] = useState<PolicyRow[]>([]);
  const [form, setForm] = useState<PolicyRow>(BLANK_POLICY);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionView, setSectionView] = useState<SectionView>('none');
  const [sectionForm, setSectionForm] = useState<Section>(BLANK_SECTION);
  const [saving, setSaving] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [sectionMsg, setSectionMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<PolicyRow[]>('/policies/admin');
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function loadSections(policyId: number) {
    try {
      const data = await apiFetch<Section[]>(`/policies/${policyId}/sections`);
      setSections(Array.isArray(data) ? data : []);
    } catch { setSections([]); }
  }

  function openAdd() {
    setForm({ ...BLANK_POLICY });
    setSections([]);
    setSectionView('none');
    setMsg(null);
    setView('add');
  }

  async function openEdit(r: PolicyRow) {
    setMsg(null);
    setSectionView('none');
    try {
      const detail = await apiFetch<{ policy: PolicyRow; sections: Section[] }>(`/policies/${r.id}`);
      setForm({ ...detail.policy });
      setSections(Array.isArray(detail.sections) ? detail.sections : []);
    } catch {
      setForm({ ...r });
      setSections([]);
    }
    setView('edit');
  }

  async function save() {
    if (!form.title?.trim()) { setMsg({ type: 'danger', text: 'Title is required.' }); return; }
    setSaving(true);
    try {
      const body = { store: 1, ...form, alias: form.alias || slugify(form.title) };
      if (form.id) {
        await apiFetch(`/policies/${form.id}`, { method: 'PUT', body: JSON.stringify(body) });
        setMsg({ type: 'success', text: 'Policy updated.' });
      } else {
        const created: any = await apiFetch('/policies', { method: 'POST', body: JSON.stringify(body) });
        setForm(f => ({ ...f, id: created.id }));
        setMsg({ type: 'success', text: 'Policy created.' });
        setView('edit');
      }
      await load();
    } catch {
      setMsg({ type: 'danger', text: 'Error saving policy.' });
    } finally { setSaving(false); }
  }

  async function saveSection() {
    if (!sectionForm.title?.trim()) { setSectionMsg({ type: 'danger', text: 'Section title is required.' }); return; }
    if (!form.id) { setSectionMsg({ type: 'danger', text: 'Save the policy first.' }); return; }
    setSavingSection(true);
    try {
      const body = { ...sectionForm, policyId: form.id };
      if (sectionForm.id) {
        await apiFetch(`/policies/sections/${sectionForm.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/policies/sections', { method: 'POST', body: JSON.stringify(body) });
      }
      setSectionView('none');
      setSectionMsg(null);
      await loadSections(form.id);
    } catch {
      setSectionMsg({ type: 'danger', text: 'Error saving section.' });
    } finally { setSavingSection(false); }
  }

  async function deleteSection(s: Section) {
    if (!confirm(`Delete section "${s.title}"?`)) return;
    await apiFetch(`/policies/sections/${s.id}`, { method: 'DELETE' });
    if (form.id) await loadSections(form.id);
  }

  /* ── LIST VIEW ── */
  if (view === 'list') {
    return (
      <AdminDataTable<PolicyRow>
        title="Policy"
        breadcrumb={[{ label: 'Policy' }]}
        addButton={{ label: 'Add New Policy', onClick: openAdd }}
        sectionTitle="List Policies"
        rows={rows}
        rowKey={r => r.id!}
        searchKeys={['title', 'alias']}
        columns={[
          { header: 'Id', cell: r => r.id, sortKey: 'id', width: 60 },
          { header: 'Title', cell: r => r.title, sortKey: 'title' },
          { header: 'Alias', cell: r => <code>{r.alias}</code>, sortKey: 'alias' },
          { header: 'Public', cell: r => r.isPublic === '1' ? 'Yes' : 'No', width: 80, align: 'center' },
          { header: 'Status', cell: r => <StatusBadge value={r.status === '1'} />, width: 100 },
        ]}
        onEdit={openEdit}
        onDelete={async r => {
          if (!confirm(`Delete policy "${r.title}"?`)) return;
          await apiFetch(`/policies/${r.id}`, { method: 'DELETE' });
          await load();
        }}
      />
    );
  }

  /* ── ADD / EDIT VIEW ── */
  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>{form.id ? 'Edit Policy' : 'Add New Policy'}</h2>
          <ol className="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('list'); }}>Policy</a></li>
            <li className="active">{form.id ? 'Edit' : 'Add'}</li>
          </ol>
        </div>
        <div className="col-sm-4" style={{ paddingTop: 20, textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="btn btn-white" onClick={() => { setView('list'); setMsg(null); }}>
            <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <i className="fa fa-check" style={{ marginRight: 4 }} />{saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="row">
          <div className="col-lg-12">

            {/* ── Policy Form ── */}
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>{form.id ? 'Edit Policy' : 'New Policy'}</h5>
              </div>
              <div className="ibox-content">
                {msg && (
                  <div className={`alert alert-${msg.type}`} style={{ padding: '8px 12px', fontSize: 13, marginBottom: 16 }}>{msg.text}</div>
                )}
                <div className="form-horizontal">
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Title <span className="text-danger">*</span></label>
                    <div className="col-sm-10">
                      <input
                        className="form-control"
                        placeholder="Policy Title"
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value, alias: f.id ? f.alias : slugify(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Alias</label>
                    <div className="col-sm-10">
                      <input
                        className="form-control"
                        value={form.alias ?? ''}
                        onChange={e => setForm(f => ({ ...f, alias: e.target.value }))}
                        style={{ background: '#f5f5f5' }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Short Description</label>
                    <div className="col-sm-10">
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.shortDescription ?? ''}
                        onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Description</label>
                    <div className="col-sm-10">
                      <RichEditor
                        value={form.description ?? ''}
                        onChange={v => setForm(f => ({ ...f, description: v }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Effective From</label>
                    <div className="col-sm-4">
                      <input
                        className="form-control"
                        type="date"
                        value={form.fromDate ?? ''}
                        onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))}
                      />
                    </div>
                    <p className="help-block col-sm-6" style={{ fontSize: 12, paddingTop: 8 }}>
                      Leave blank if effective immediately on publish.
                    </p>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Public</label>
                    <div className="col-sm-10">
                      <select
                        className="form-control"
                        value={form.isPublic}
                        onChange={e => setForm(f => ({ ...f, isPublic: e.target.value as '0' | '1' }))}
                      >
                        <option value="1">Yes — visible to all</option>
                        <option value="0">No — restricted to assigned roles</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Status</label>
                    <div className="col-sm-10">
                      <select
                        className="form-control"
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value as '0' | '1' }))}
                      >
                        <option value="1">Enable</option>
                        <option value="0">Disable</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Sections (only when editing an existing policy) ── */}
            {view === 'edit' && form.id && (
              <div className="ibox float-e-margins">
                <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h5 style={{ margin: 0 }}>Sections ({sections.length})</h5>
                  {sectionView === 'none' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { setSectionForm({ ...BLANK_SECTION }); setSectionMsg(null); setSectionView('add'); }}
                    >
                      <i className="fa fa-plus" style={{ marginRight: 4 }} />Add Section
                    </button>
                  )}
                </div>
                <div className="ibox-content">

                  {/* Section Add/Edit Form */}
                  {sectionView !== 'none' && (
                    <div style={{ background: '#f8f8f8', border: '1px solid #e5e6e7', borderRadius: 4, padding: 16, marginBottom: 16 }}>
                      <h5 style={{ marginTop: 0 }}>{sectionView === 'add' ? 'Add Section' : 'Edit Section'}</h5>
                      {sectionMsg && (
                        <div className={`alert alert-${sectionMsg.type}`} style={{ padding: '8px 12px', fontSize: 13, marginBottom: 12 }}>{sectionMsg.text}</div>
                      )}
                      <div className="form-horizontal">
                        <div className="form-group">
                          <label className="col-sm-2 control-label">Section No.</label>
                          <div className="col-sm-4">
                            <input
                              className="form-control"
                              placeholder="e.g. 1.1"
                              value={sectionForm.sectionNo ?? ''}
                              onChange={e => setSectionForm(f => ({ ...f, sectionNo: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="col-sm-2 control-label">Title <span className="text-danger">*</span></label>
                          <div className="col-sm-10">
                            <input
                              className="form-control"
                              placeholder="Section Title"
                              value={sectionForm.title ?? ''}
                              onChange={e => setSectionForm(f => ({ ...f, title: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="col-sm-2 control-label">Description</label>
                          <div className="col-sm-10">
                            <RichEditor
                              value={sectionForm.description ?? ''}
                              onChange={v => setSectionForm(f => ({ ...f, description: v }))}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="col-sm-2 control-label">Active</label>
                          <div className="col-sm-4">
                            <select
                              className="form-control"
                              value={sectionForm.isActive}
                              onChange={e => setSectionForm(f => ({ ...f, isActive: e.target.value as '0' | '1' }))}
                            >
                              <option value="1">Yes</option>
                              <option value="0">No</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-white btn-sm"
                          onClick={() => { setSectionView('none'); setSectionMsg(null); }}
                        >Cancel</button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={saveSection}
                          disabled={savingSection}
                        >
                          <i className="fa fa-check" style={{ marginRight: 4 }} />
                          {savingSection ? 'Saving…' : 'Save Section'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sections Table */}
                  {sections.length === 0 ? (
                    <p className="text-muted" style={{ textAlign: 'center', padding: 20 }}>No sections yet. Click "Add Section" to create one.</p>
                  ) : (
                    <table className="table table-striped table-bordered table-hover">
                      <thead>
                        <tr>
                          <th style={{ width: 80 }}>No.</th>
                          <th>Title</th>
                          <th style={{ width: 80, textAlign: 'center' }}>Active</th>
                          <th style={{ width: 160 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sections.map(s => (
                          <tr key={s.id}>
                            <td style={{ verticalAlign: 'middle' }}>{s.sectionNo}</td>
                            <td style={{ verticalAlign: 'middle' }}>{s.title}</td>
                            <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                              <StatusBadge value={s.isActive === '1'} trueLabel="Yes" falseLabel="No" />
                            </td>
                            <td style={{ verticalAlign: 'middle' }}>
                              <button
                                className="btn btn-danger btn-xs"
                                style={{ marginRight: 4 }}
                                onClick={() => deleteSection(s)}
                              >
                                <i className="fa fa-times" style={{ marginRight: 3 }} />Delete
                              </button>
                              <button
                                className="btn btn-white btn-xs"
                                onClick={() => { setSectionForm({ ...s }); setSectionMsg(null); setSectionView('edit'); }}
                              >
                                <i className="fa fa-pencil" style={{ marginRight: 3 }} />Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
