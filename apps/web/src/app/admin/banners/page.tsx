'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/auth';
import { AdminDataTable, StatusBadge } from '@/components/admin/AdminDataTable';
import { FileUpload } from '@/components/admin/FileUpload';

interface Banner {
  id?: number;
  title: string;
  url: string;
  image?: string;
  content?: string;
  isActive?: '0' | '1';
  sortOrder?: number;
  store?: number;
}

type View = 'list' | 'add' | 'edit';

const BLANK: Banner = { title: '', url: '', image: '', content: '', isActive: '1', sortOrder: 0 };

export default function BannersAdminPage() {
  const [view, setView] = useState<View>('list');
  const [rows, setRows] = useState<Banner[]>([]);
  const [form, setForm] = useState<Banner>(BLANK);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'image'>('general');

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Banner[]>('/banners?store=1');
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setForm({ ...BLANK });
    setActiveTab('general');
    setMsg(null);
    setView('add');
  }

  function openEdit(row: Banner) {
    setForm({ ...row });
    setActiveTab('general');
    setMsg(null);
    setView('edit');
  }

  async function save() {
    if (!form.title?.trim()) { setMsg({ type: 'danger', text: 'Title is required.' }); return; }
    setSaving(true);
    try {
      const body = { store: 1, ...form };
      if (form.id) await apiFetch(`/banners/${form.id}`, { method: 'PUT', body: JSON.stringify(body) });
      else await apiFetch('/banners', { method: 'POST', body: JSON.stringify(body) });
      setMsg({ type: 'success', text: 'Saved successfully.' });
      await load();
      setTimeout(() => setView('list'), 800);
    } catch {
      setMsg({ type: 'danger', text: 'Error saving banner.' });
    } finally { setSaving(false); }
  }

  async function handleDelete(row: Banner) {
    if (!confirm(`Delete banner "${row.title}"?`)) return;
    await apiFetch(`/banners/${row.id}`, { method: 'DELETE' });
    await load();
  }

  /* ---- LIST ---- */
  if (view === 'list') {
    return (
      <AdminDataTable<Banner>
        title="Banner"
        breadcrumb={[{ label: 'Banner' }]}
        addButton={{ label: 'Add New Banner', onClick: openAdd }}
        sectionTitle="List Banners"
        rows={rows}
        rowKey={r => r.id!}
        searchKeys={['title', 'url']}
        columns={[
          { header: 'Id', cell: r => r.id, sortKey: 'id', width: 60 },
          { header: 'Title', cell: r => r.title, sortKey: 'title' },
          {
            header: 'Image', width: 130,
            cell: r => r.image
              ? <img src={r.image} alt={r.title} style={{ height: 40, borderRadius: 4, maxWidth: 120, objectFit: 'cover' }} />
              : <span style={{ color: '#bbb' }}>—</span>,
          },
          {
            header: 'Is Active', width: 100,
            cell: r => <StatusBadge value={r.isActive === '1'} trueLabel="Yes" falseLabel="No" />,
          },
        ]}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    );
  }

  /* ---- ADD / EDIT ---- */
  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>{view === 'add' ? 'Add New Banner' : 'Edit Banner'}</h2>
          <ol className="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('list'); }}>Banner</a></li>
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
                  <div className={`alert alert-${msg.type}`} style={{ padding: '8px 12px', fontSize: 13, marginBottom: 16 }}>
                    {msg.text}
                  </div>
                )}

                {/* Tabs */}
                <ul className="nav nav-tabs">
                  <li className={activeTab === 'general' ? 'active' : ''}>
                    <a href="#" onClick={e => { e.preventDefault(); setActiveTab('general'); }}>General</a>
                  </li>
                  <li className={activeTab === 'image' ? 'active' : ''}>
                    <a href="#" onClick={e => { e.preventDefault(); setActiveTab('image'); }}>Image</a>
                  </li>
                </ul>

                <div className="tab-content" style={{ paddingTop: 20 }}>
                  {/* General Tab */}
                  <div className={`tab-pane ${activeTab === 'general' ? 'active' : ''}`}>
                    <div className="form-horizontal">
                      <div className="form-group">
                        <label className="col-sm-2 control-label">Title</label>
                        <div className="col-sm-10">
                          <input className="form-control" placeholder="Enter Title here. . ."
                            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="col-sm-2 control-label">Url</label>
                        <div className="col-sm-10">
                          <input className="form-control" placeholder="eg.. https://www.hero.com"
                            value={form.url ?? ''} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="col-sm-2 control-label">Content</label>
                        <div className="col-sm-10">
                          <textarea className="form-control" rows={4} placeholder="Banner Content Here.."
                            value={form.content ?? ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="col-sm-2 control-label">Is Active</label>
                        <div className="col-sm-10">
                          <select className="form-control" value={form.isActive ?? '1'}
                            onChange={e => setForm(f => ({ ...f, isActive: e.target.value as '0' | '1' }))}>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="col-sm-2 control-label">Sort Order</label>
                        <div className="col-sm-10">
                          <input className="form-control" type="number"
                            value={form.sortOrder ?? 0}
                            onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Tab */}
                  <div className={`tab-pane ${activeTab === 'image' ? 'active' : ''}`}>
                    <div className="form-horizontal">
                      <div className="form-group">
                        <label className="col-sm-2 control-label">Image</label>
                        <div className="col-sm-10">
                          {form.image && (
                            <div style={{ marginBottom: 10 }}>
                              <img src={form.image} alt="Banner" style={{ maxHeight: 200, borderRadius: 4, marginBottom: 8 }} />
                              <br />
                              <button className="btn btn-danger btn-xs" onClick={() => setForm(f => ({ ...f, image: '' }))}>
                                <i className="fa fa-times" /> Remove
                              </button>
                            </div>
                          )}
                          <FileUpload onUploaded={files => setForm(f => ({ ...f, image: files[0]?.url ?? '' }))} />
                        </div>
                      </div>
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
