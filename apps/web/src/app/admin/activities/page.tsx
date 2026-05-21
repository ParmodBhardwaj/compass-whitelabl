'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/auth';
import { AdminDataTable, StatusBadge } from '@/components/admin/AdminDataTable';
import { FileUpload } from '@/components/admin/FileUpload';
import { RichEditor } from '@/components/admin/RichEditor';

interface Activity {
  id?: number;
  title: string;
  alias?: string;
  shortDescription?: string;
  description?: string;
  activityDate?: string;
  image?: string;
  isFeatured: '0' | '1';
  status: '0' | '1';
  store?: number;
}

type View = 'list' | 'add' | 'edit';

const BLANK: Activity = {
  title: '',
  alias: '',
  shortDescription: '',
  description: '',
  activityDate: new Date().toISOString().slice(0, 10),
  image: '',
  isFeatured: '0',
  status: '1',
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ActivitiesAdmin() {
  const [view, setView] = useState<View>('list');
  const [rows, setRows] = useState<Activity[]>([]);
  const [form, setForm] = useState<Activity>(BLANK);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Activity[]>('/activities?status=&limit=200');
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setForm({ ...BLANK }); setMsg(null); setView('add'); }
  function openEdit(r: Activity) { setForm({ ...r }); setMsg(null); setView('edit'); }

  async function save() {
    if (!form.title?.trim()) { setMsg({ type: 'danger', text: 'Title is required.' }); return; }
    setSaving(true);
    try {
      const body = {
        store: 1,
        ...form,
        alias: form.alias || slugify(form.title),
      };
      if (form.id) {
        await apiFetch(`/activities/${form.id}`, { method: 'PUT', body: JSON.stringify(body) });
        setMsg({ type: 'success', text: 'Activity updated.' });
      } else {
        await apiFetch('/activities', { method: 'POST', body: JSON.stringify(body) });
        setMsg({ type: 'success', text: 'Activity created.' });
        setTimeout(() => setView('list'), 600);
      }
      await load();
    } catch {
      setMsg({ type: 'danger', text: 'Error saving activity.' });
    } finally { setSaving(false); }
  }

  /* ── LIST VIEW ── */
  if (view === 'list') {
    return (
      <AdminDataTable<Activity>
        title="Activities"
        breadcrumb={[{ label: 'Activities' }]}
        addButton={{ label: 'Add New Activity', onClick: openAdd }}
        sectionTitle="List Activities"
        rows={rows}
        rowKey={r => r.id!}
        searchKeys={['title']}
        columns={[
          { header: 'Id', cell: r => r.id, sortKey: 'id', width: 60 },
          { header: 'Title', cell: r => r.title, sortKey: 'title' },
          { header: 'Date', cell: r => r.activityDate, sortKey: 'activityDate', width: 130 },
          { header: 'Featured', cell: r => r.isFeatured === '1' ? '★' : '', width: 80, align: 'center' },
          { header: 'Status', cell: r => <StatusBadge value={r.status === '1'} />, width: 100 },
        ]}
        onEdit={openEdit}
        onDelete={async r => {
          if (!confirm(`Delete "${r.title}"?`)) return;
          await apiFetch(`/activities/${r.id}`, { method: 'DELETE' });
          await load();
        }}
      />
    );
  }

  /* ── ADD / EDIT VIEW ── */
  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>{form.id ? 'Edit Activity' : 'Add New Activity'}</h2>
          <ol className="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('list'); }}>Activities</a></li>
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
            <div className="ibox float-e-margins">
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
                        placeholder="Activity Title"
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
                    <label className="col-sm-2 control-label">Date</label>
                    <div className="col-sm-10">
                      <input
                        className="form-control"
                        type="date"
                        value={form.activityDate ?? ''}
                        onChange={e => setForm(f => ({ ...f, activityDate: e.target.value }))}
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
                    <label className="col-sm-2 control-label">Image</label>
                    <div className="col-sm-10">
                      {form.image && (
                        <div style={{ marginBottom: 8 }}>
                          <img src={form.image} alt="" style={{ height: 80, borderRadius: 4 }} />
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            style={{ marginLeft: 8, verticalAlign: 'bottom' }}
                            onClick={() => setForm(f => ({ ...f, image: '' }))}
                          >Remove</button>
                        </div>
                      )}
                      <FileUpload onUploaded={files => setForm(f => ({ ...f, image: files[0]?.url ?? '' }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Featured</label>
                    <div className="col-sm-10">
                      <select
                        className="form-control"
                        value={form.isFeatured}
                        onChange={e => setForm(f => ({ ...f, isFeatured: e.target.value as '0' | '1' }))}
                      >
                        <option value="0">No</option>
                        <option value="1">Yes</option>
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
          </div>
        </div>
      </div>
    </>
  );
}
