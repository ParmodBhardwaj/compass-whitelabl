'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/auth';
import { AdminDataTable, StatusBadge } from '@/components/admin/AdminDataTable';
import { FileUpload } from '@/components/admin/FileUpload';
import type { NewsItem } from '@/lib/api';

type View = 'list' | 'add' | 'edit';

// Initial form state — covers every NOT-NULL column from the legacy
// `news` table (see module/News/src/Entity/News.php). description and
// meta-* fields are NULLABLE in the schema but kept on the form for parity
// with the legacy admin.
const BLANK: Partial<NewsItem> = {
  title: '',
  newsType: '1' as any,
  status: '1',
  newsDate: new Date().toISOString().slice(0, 10),
  isFeatured: '0',
  shortDescription: '',
  description: '',
  image: '',
};

export default function NewsAdmin() {
  const [view, setView] = useState<View>('list');
  const [rows, setRows] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<Partial<NewsItem>>(BLANK);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const load = useCallback(async () => {
    try { setRows(await apiFetch<NewsItem[]>('/news?store=1&limit=200')); } catch { setRows([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  function openAdd() { setForm({ ...BLANK }); setMsg(null); setView('add'); }
  function openEdit(r: NewsItem) { setForm({ ...r }); setMsg(null); setView('edit'); }

  async function save() {
    // Legacy NewsForm.php validators: title + shortDescription + alias all
    // marked required. We auto-generate the alias from title in the service,
    // so just enforce title + shortDescription here.
    if (!form.title?.trim()) { setMsg({ type: 'danger', text: 'Title is required.' }); return; }
    if (!form.shortDescription?.trim()) { setMsg({ type: 'danger', text: 'Short description is required.' }); return; }
    setSaving(true);
    try {
      const body = { newsType: '1', store: 1, ...form };
      if (form.id) await apiFetch(`/news/${form.id}`, { method: 'PUT', body: JSON.stringify(body) });
      else await apiFetch('/news', { method: 'POST', body: JSON.stringify(body) });
      setMsg({ type: 'success', text: 'Saved.' });
      await load();
      setTimeout(() => setView('list'), 600);
    } catch { setMsg({ type: 'danger', text: 'Error saving.' }); }
    finally { setSaving(false); }
  }

  if (view === 'list') {
    return (
      <AdminDataTable<NewsItem>
        title="News"
        breadcrumb={[{ label: 'News' }]}
        addButton={{ label: 'Add New News', onClick: openAdd }}
        sectionTitle="List News"
        rows={rows}
        rowKey={r => r.id!}
        searchKeys={['title']}
        columns={[
          { header: 'Id', cell: r => r.id, sortKey: 'id', width: 60 },
          { header: 'Title', cell: r => r.title, sortKey: 'title' },
          { header: 'Date', cell: r => r.newsDate, sortKey: 'newsDate', width: 130 },
          { header: 'Featured', cell: r => r.isFeatured === '1' ? '★' : '', width: 80, align: 'center' },
          { header: 'Status', cell: r => <StatusBadge value={r.status === '1'} />, width: 100 },
        ]}
        onEdit={openEdit}
        onDelete={async r => {
          if (!confirm(`Delete "${r.title}"?`)) return;
          await apiFetch(`/news/${r.id}`, { method: 'DELETE' });
          await load();
        }}
      />
    );
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>{form.id ? 'Edit News' : 'Add New News'}</h2>
          <ol className="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('list'); }}>News</a></li>
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
                {msg && <div className={`alert alert-${msg.type}`} style={{ padding: '8px 12px', fontSize: 13, marginBottom: 16 }}>{msg.text}</div>}
                <div className="form-horizontal">
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Title *</label>
                    <div className="col-sm-10">
                      <input className="form-control" value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Date</label>
                    <div className="col-sm-10">
                      <input className="form-control" type="date" value={form.newsDate ?? ''} onChange={e => setForm(f => ({ ...f, newsDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Short Description *</label>
                    <div className="col-sm-10">
                      <textarea
                        className="form-control"
                        rows={3}
                        required
                        value={form.shortDescription ?? ''}
                        onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Full Description</label>
                    <div className="col-sm-10">
                      <textarea
                        className="form-control"
                        rows={6}
                        placeholder="Long-form article body (HTML allowed)"
                        value={form.description ?? ''}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Image</label>
                    <div className="col-sm-10">
                      {form.image && <img src={form.image} alt="" style={{ height: 80, borderRadius: 4, marginBottom: 8 }} />}
                      <FileUpload onUploaded={files => setForm(f => ({ ...f, image: files[0]?.url ?? '' }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Featured</label>
                    <div className="col-sm-10">
                      <select className="form-control" value={form.isFeatured ?? '0'} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.value as any }))}>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Status</label>
                    <div className="col-sm-10">
                      <select className="form-control" value={form.status ?? '0'} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                        <option value="0">Draft</option>
                        <option value="1">Live</option>
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
