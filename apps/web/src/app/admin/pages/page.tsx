'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/auth';
import { AdminDataTable, StatusBadge } from '@/components/admin/AdminDataTable';
import { FileUpload } from '@/components/admin/FileUpload';
import { RichEditor } from '@/components/admin/RichEditor';

interface CmsPage {
  id?: number;
  title: string;
  alias?: string;
  shortDescription?: string;
  description?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  status: '0' | '1';
  roleId?: number | null;
  store?: number;
}

interface PageImage { id: number; image?: string; title?: string; }

type View = 'list' | 'add' | 'edit';

const BLANK: CmsPage = {
  title: '', alias: '', shortDescription: '', description: '',
  metaTitle: '', metaKeywords: '', metaDescription: '', status: '1',
  roleId: null,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function PagesAdminPage() {
  const [view, setView] = useState<View>('list');
  const [rows, setRows] = useState<CmsPage[]>([]);
  const [form, setForm] = useState<CmsPage>(BLANK);
  const [images, setImages] = useState<PageImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<CmsPage[]>('/cms/pages?store=1');
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setForm({ ...BLANK });
    setImages([]);
    setMsg(null);
    setView('add');
  }

  async function openEdit(row: CmsPage) {
    setMsg(null);
    try {
      const full = await apiFetch<{ page: CmsPage; images: PageImage[] }>(`/cms/pages/${row.id}`);
      setForm({ ...full.page });
      setImages(full.images ?? []);
    } catch {
      setForm({ ...row });
      setImages([]);
    }
    setView('edit');
  }

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
        await apiFetch(`/cms/pages/${form.id}`, { method: 'PUT', body: JSON.stringify(body) });
        setMsg({ type: 'success', text: 'Page updated.' });
      } else {
        const created: any = await apiFetch('/cms/pages', { method: 'POST', body: JSON.stringify(body) });
        setForm(f => ({ ...f, id: created.id }));
        setMsg({ type: 'success', text: 'Page created.' });
        setView('edit');
      }
      await load();
    } catch {
      setMsg({ type: 'danger', text: 'Error saving page.' });
    } finally { setSaving(false); }
  }

  async function handleDelete(row: CmsPage) {
    if (!confirm(`Delete page "${row.title}"?`)) return;
    await apiFetch(`/cms/pages/${row.id}`, { method: 'DELETE' });
    await load();
  }

  async function uploadImages(files: Array<{ url: string; filename: string }>) {
    if (!form.id) return;
    await apiFetch(`/cms/pages/${form.id}/images`, {
      method: 'POST',
      body: JSON.stringify({ images: files.map(f => ({ image: f.url, title: f.filename })) }),
    });
    const full = await apiFetch<{ page: CmsPage; images: PageImage[] }>(`/cms/pages/${form.id}`);
    setImages(full.images ?? []);
  }

  async function deleteImage(id: number) {
    await apiFetch(`/cms/pages/images/${id}`, { method: 'DELETE' });
    setImages(imgs => imgs.filter(i => i.id !== id));
  }

  /* ── LIST VIEW ── */
  if (view === 'list') {
    return (
      <AdminDataTable<CmsPage>
        title="Pages"
        breadcrumb={[{ label: 'CMS Pages' }]}
        sectionTitle="List CMS Pages"
        addButton={{ label: 'Add New Page', onClick: openAdd }}
        rows={rows}
        rowKey={r => r.id!}
        searchKeys={['title', 'alias']}
        columns={[
          { header: 'Id', cell: r => r.id, sortKey: 'id', width: 60 },
          { header: 'Title', cell: r => r.title, sortKey: 'title' },
          { header: 'Alias', cell: r => <code>{r.alias}</code>, sortKey: 'alias' },
          {
            header: 'Status', width: 100,
            cell: r => <StatusBadge value={r.status === '1'} />,
          },
        ]}
        onEdit={openEdit}
        onDelete={handleDelete}
        onView={r => window.open(`/pages/${r.alias}`, '_blank')}
      />
    );
  }

  /* ── ADD / EDIT VIEW ── */
  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>{view === 'add' ? 'Add New Page' : 'Edit Page'}</h2>
          <ol className="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('list'); }}>CMS Pages</a></li>
            <li className="active">{view === 'add' ? 'Add' : 'Edit'}</li>
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
                <ul className="nav nav-tabs"><li className="active"><a href="#">General</a></li></ul>
                <div style={{ paddingTop: 20 }}>
                  <div className="form-horizontal">
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Title <span className="text-danger">*</span></label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Page Title"
                          value={form.title}
                          onChange={e => setForm(f => ({ ...f, title: e.target.value, alias: f.id ? f.alias : slugify(e.target.value) }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Alias</label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Page Alias"
                          value={form.alias ?? ''}
                          onChange={e => setForm(f => ({ ...f, alias: e.target.value }))}
                          style={{ background: '#f5f5f5' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Short Description</label>
                      <div className="col-sm-10">
                        <textarea className="form-control" rows={3} placeholder="Short Description"
                          value={form.shortDescription ?? ''}
                          onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Description</label>
                      <div className="col-sm-10">
                        <RichEditor
                          value={form.description ?? ''}
                          onChange={v => setForm(f => ({ ...f, description: v }))}
                        />
                        <p className="help-block" style={{ fontSize: 12, marginTop: 4 }}>
                          Please use <code>[Gallery]</code> shortcode for Gallery
                        </p>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Meta Title</label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Meta Title"
                          value={form.metaTitle ?? ''}
                          onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Meta Keywords</label>
                      <div className="col-sm-10">
                        <textarea className="form-control" rows={3} placeholder="Meta Keywords"
                          value={form.metaKeywords ?? ''}
                          onChange={e => setForm(f => ({ ...f, metaKeywords: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Meta Description</label>
                      <div className="col-sm-10">
                        <textarea className="form-control" rows={3} placeholder="Meta Description"
                          value={form.metaDescription ?? ''}
                          onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Role Restriction</label>
                      <div className="col-sm-10">
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Leave blank for everyone, or enter an acl_roles.role_id"
                          value={form.roleId ?? ''}
                          onChange={e => setForm(f => ({
                            ...f,
                            roleId: e.target.value === '' ? null : Number(e.target.value),
                          }))}
                        />
                        <p className="help-block" style={{ fontSize: 12, marginTop: 4 }}>
                          Restricts which ACL role can view this page. Empty = public.
                        </p>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Status</label>
                      <div className="col-sm-10">
                        <select className="form-control"
                          value={form.status}
                          onChange={e => setForm(f => ({ ...f, status: e.target.value as '0' | '1' }))}>
                          <option value="1">Enable</option>
                          <option value="0">Disable</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Images (only on edit) */}
                  {view === 'edit' && form.id && (
                    <>
                      <hr />
                      <h4>Images ({images.length})</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, marginBottom: 12 }}>
                        {images.map(img => (
                          <div key={img.id} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', background: '#f0f0f0' }}>
                            <img src={img.image} alt={img.title} style={{ width: '100%', height: 90, objectFit: 'cover' }} />
                            <button
                              className="btn btn-danger btn-xs"
                              style={{ position: 'absolute', top: 4, right: 4 }}
                              onClick={() => deleteImage(img.id)}
                            >×</button>
                          </div>
                        ))}
                      </div>
                      <FileUpload multiple onUploaded={uploadImages} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
