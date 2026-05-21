'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/auth';
import { AdminDataTable, StatusBadge } from '@/components/admin/AdminDataTable';
import { FileUpload } from '@/components/admin/FileUpload';

/* ─── types ─────────────────────────────────────────────────── */
interface Category { id: number; name: string; alias: string; sortorder: number; }

interface GalleryItem {
  id?: number;
  title: string;
  alias?: string;
  category?: number | null;
  date?: string;
  status: '0' | '1';
  sortorder?: number;
  store?: number;
}

interface GalleryImage {
  id: number; image: string; title?: string; isFeatured?: '0' | '1';
}

type Section = 'gallery-list' | 'gallery-add' | 'gallery-edit'
             | 'cat-list' | 'cat-add' | 'cat-edit';

const BLANK_GAL: GalleryItem = { title: '', alias: '', category: null, date: '', status: '1', sortorder: 0 };
const BLANK_CAT: Category = { id: 0, name: '', alias: '', sortorder: 0 };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* ─── helper sub-components ─────────────────────────────────── */

function CategoryForm({
  form, setForm, onSave, onBack, onDelete, saving, msg,
}: {
  form: Category; setForm: (f: Category) => void;
  onSave: () => void; onBack: () => void;
  onDelete?: () => void; saving: boolean;
  msg: { type: 'success' | 'danger'; text: string } | null;
}) {
  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>{form.id ? 'Edit Category' : 'Add New Category'}</h2>
          <ol className="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); onBack(); }}>Gallery Category</a></li>
            <li className="active">{form.id ? 'Edit' : 'Add'}</li>
          </ol>
        </div>
        <div className="col-sm-4" style={{ paddingTop: 20, textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="btn btn-white" onClick={onBack}><i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back</button>
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
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
                    <label className="col-sm-2 control-label">Name</label>
                    <div className="col-sm-10">
                      <input className="form-control" placeholder="Category Name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value, alias: form.id ? form.alias : slugify(e.target.value) })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Alias</label>
                    <div className="col-sm-10">
                      <input className="form-control" placeholder="Page Alias"
                        value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })}
                        style={{ background: '#f5f5f5' }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-2 control-label">Sort Order</label>
                    <div className="col-sm-10">
                      <input className="form-control" type="number" placeholder="Sort Order"
                        value={form.sortorder}
                        onChange={e => setForm({ ...form, sortorder: Number(e.target.value) })} />
                    </div>
                  </div>
                  {form.id > 0 && onDelete && (
                    <div className="form-group">
                      <div className="col-sm-offset-2 col-sm-10">
                        <button className="btn btn-danger btn-sm" onClick={onDelete}>
                          <i className="fa fa-trash" style={{ marginRight: 4 }} />Delete Category
                        </button>
                      </div>
                    </div>
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

function GalleryForm({
  form, setForm, categories, onSave, onBack, onDelete, saving, msg,
  images, onUploadImages, onDeleteImage, onToggleFeatured,
}: {
  form: GalleryItem; setForm: (f: GalleryItem) => void;
  categories: Category[];
  onSave: () => void; onBack: () => void;
  onDelete?: () => void; saving: boolean;
  msg: { type: 'success' | 'danger'; text: string } | null;
  images?: GalleryImage[];
  onUploadImages?: (files: Array<{ url: string; filename: string }>) => void;
  onDeleteImage?: (id: number) => void;
  onToggleFeatured?: (img: GalleryImage) => void;
}) {
  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>{form.id ? 'Edit Gallery' : 'Add New Gallery'}</h2>
          <ol className="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); onBack(); }}>Gallery</a></li>
            <li className="active">{form.id ? 'Edit' : 'Add'}</li>
          </ol>
        </div>
        <div className="col-sm-4" style={{ paddingTop: 20, textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="btn btn-white" onClick={onBack}><i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back</button>
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
            <i className="fa fa-check" style={{ marginRight: 4 }} />{saving ? 'Saving…' : form.id ? 'Save' : 'Save & Continue'}
          </button>
        </div>
      </div>
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-content">
                {msg && <div className={`alert alert-${msg.type}`} style={{ padding: '8px 12px', fontSize: 13, marginBottom: 16 }}>{msg.text}</div>}
                <ul className="nav nav-tabs"><li className="active"><a href="#">General</a></li></ul>
                <div style={{ paddingTop: 20 }}>
                  <div className="form-horizontal">
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Title</label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Enter Title here. . ."
                          value={form.title}
                          onChange={e => setForm({ ...form, title: e.target.value, alias: form.id ? form.alias : slugify(e.target.value) })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Alias</label>
                      <div className="col-sm-10">
                        <input className="form-control" placeholder="Page Alias"
                          value={form.alias ?? ''}
                          onChange={e => setForm({ ...form, alias: e.target.value })}
                          style={{ background: '#f5f5f5' }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Category</label>
                      <div className="col-sm-10">
                        <select className="form-control"
                          value={form.category ?? ''}
                          onChange={e => setForm({ ...form, category: e.target.value ? Number(e.target.value) : null })}>
                          <option value="">-- Please Select --</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Date</label>
                      <div className="col-sm-10">
                        <input className="form-control" type="date"
                          value={form.date ?? ''}
                          onChange={e => setForm({ ...form, date: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Status</label>
                      <div className="col-sm-10">
                        <select className="form-control"
                          value={form.status}
                          onChange={e => setForm({ ...form, status: e.target.value as '0' | '1' })}>
                          <option value="1">Enable</option>
                          <option value="0">Disable</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-2 control-label">Sort Order</label>
                      <div className="col-sm-10">
                        <input className="form-control" type="number"
                          value={form.sortorder ?? 0}
                          onChange={e => setForm({ ...form, sortorder: Number(e.target.value) })} />
                      </div>
                    </div>
                  </div>

                  {/* Images section (only when editing) */}
                  {form.id && onUploadImages && (
                    <>
                      <hr />
                      <h4>Images ({images?.length ?? 0})</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginBottom: 12 }}>
                        {(images ?? []).map(img => (
                          <div key={img.id} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden' }}>
                            <img src={img.image} alt={img.title} style={{ width: '100%', height: 90, objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 4, left: 4 }}>
                              <button
                                className={`btn btn-xs ${img.isFeatured === '1' ? 'btn-warning' : 'btn-default'}`}
                                onClick={() => onToggleFeatured?.(img)} title="Featured"
                              >★</button>
                            </div>
                            <div style={{ position: 'absolute', top: 4, right: 4 }}>
                              <button className="btn btn-danger btn-xs" onClick={() => onDeleteImage?.(img.id)}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FileUpload multiple onUploaded={onUploadImages} />
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

/* ─── Main page component ──────────────────────────────────── */
export default function GalleryAdminPage() {
  const [section, setSection] = useState<Section>('gallery-list');

  // Gallery state
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [galForm, setGalForm] = useState<GalleryItem>(BLANK_GAL);
  const [galImages, setGalImages] = useState<GalleryImage[]>([]);
  const [galSaving, setGalSaving] = useState(false);
  const [galMsg, setGalMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState<Category>(BLANK_CAT);
  const [catSaving, setCatSaving] = useState(false);
  const [catMsg, setCatMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const load = useCallback(async () => {
    try { setGalleries(await apiFetch<GalleryItem[]>('/galleries/admin')); } catch { setGalleries([]); }
    try { setCategories(await apiFetch<Category[]>('/galleries/categories')); } catch { setCategories([]); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Gallery CRUD ── */
  async function galSave() {
    if (!galForm.title?.trim()) { setGalMsg({ type: 'danger', text: 'Title is required.' }); return; }
    setGalSaving(true);
    try {
      const body = { store: 1, ...galForm };
      if (galForm.id) {
        await apiFetch(`/galleries/${galForm.id}`, { method: 'PUT', body: JSON.stringify(body) });
        setGalMsg({ type: 'success', text: 'Saved.' });
        // reload images
        const full = await apiFetch<{ gallery: GalleryItem; images: GalleryImage[] }>(`/galleries/${galForm.id}`);
        setGalImages(full.images ?? []);
      } else {
        const created: any = await apiFetch('/galleries', { method: 'POST', body: JSON.stringify(body) });
        setGalForm(f => ({ ...f, id: created.id }));
        setGalMsg({ type: 'success', text: 'Gallery created. You can now add images.' });
        setSection('gallery-edit');
      }
      await load();
    } catch { setGalMsg({ type: 'danger', text: 'Error saving gallery.' }); }
    finally { setGalSaving(false); }
  }

  async function galDelete() {
    if (!galForm.id || !confirm(`Delete gallery "${galForm.title}"?`)) return;
    await apiFetch(`/galleries/${galForm.id}`, { method: 'DELETE' });
    await load();
    setSection('gallery-list');
  }

  async function openEditGallery(row: GalleryItem) {
    setGalMsg(null);
    try {
      const full = await apiFetch<{ gallery: GalleryItem; images: GalleryImage[] }>(`/galleries/${row.id}`);
      setGalForm({ ...full.gallery });
      setGalImages(full.images ?? []);
    } catch {
      setGalForm({ ...row });
      setGalImages([]);
    }
    setSection('gallery-edit');
  }

  async function uploadImages(files: Array<{ url: string; filename: string }>) {
    if (!galForm.id) return;
    await apiFetch(`/galleries/${galForm.id}/images`, {
      method: 'POST',
      body: JSON.stringify({ images: files.map(f => ({ image: f.url, title: f.filename })) }),
    });
    const full = await apiFetch<{ gallery: GalleryItem; images: GalleryImage[] }>(`/galleries/${galForm.id}`);
    setGalImages(full.images ?? []);
  }

  async function deleteImage(id: number) {
    await apiFetch('/galleries/images', { method: 'DELETE', body: JSON.stringify({ ids: [id] }) });
    setGalImages(imgs => imgs.filter(i => i.id !== id));
  }

  async function toggleFeatured(img: GalleryImage) {
    await apiFetch(`/galleries/images/${img.id}/featured`, {
      method: 'PUT',
      body: JSON.stringify({ featured: img.isFeatured === '1' ? '0' : '1' }),
    });
    setGalImages(imgs => imgs.map(i => i.id === img.id ? { ...i, isFeatured: i.isFeatured === '1' ? '0' : '1' } : i));
  }

  /* ── Category CRUD ── */
  async function catSave() {
    if (!catForm.name?.trim()) { setCatMsg({ type: 'danger', text: 'Name is required.' }); return; }
    setCatSaving(true);
    try {
      if (catForm.id) await apiFetch(`/galleries/categories/${catForm.id}`, { method: 'PUT', body: JSON.stringify(catForm) });
      else await apiFetch('/galleries/categories', { method: 'POST', body: JSON.stringify(catForm) });
      setCatMsg({ type: 'success', text: 'Saved successfully.' });
      await load();
      setTimeout(() => setSection('cat-list'), 800);
    } catch { setCatMsg({ type: 'danger', text: 'Error saving category.' }); }
    finally { setCatSaving(false); }
  }

  async function catDelete() {
    if (!catForm.id || !confirm(`Delete category "${catForm.name}"?`)) return;
    await apiFetch(`/galleries/categories/${catForm.id}`, { method: 'DELETE' });
    await load();
    setSection('cat-list');
  }

  /* ── Section routing ── */
  if (section === 'cat-add' || section === 'cat-edit') {
    return (
      <CategoryForm
        form={catForm} setForm={setCatForm}
        onSave={catSave} onBack={() => setSection('cat-list')}
        onDelete={section === 'cat-edit' ? catDelete : undefined}
        saving={catSaving} msg={catMsg}
      />
    );
  }

  if (section === 'gallery-add' || section === 'gallery-edit') {
    return (
      <GalleryForm
        form={galForm} setForm={setGalForm}
        categories={categories}
        onSave={galSave} onBack={() => setSection('gallery-list')}
        onDelete={section === 'gallery-edit' ? galDelete : undefined}
        saving={galSaving} msg={galMsg}
        images={section === 'gallery-edit' ? galImages : undefined}
        onUploadImages={section === 'gallery-edit' ? uploadImages : undefined}
        onDeleteImage={section === 'gallery-edit' ? deleteImage : undefined}
        onToggleFeatured={section === 'gallery-edit' ? toggleFeatured : undefined}
      />
    );
  }

  const sectionTabs = (
    <ul className="nav nav-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
      <li className={section === 'gallery-list' ? 'active' : ''}>
        <a href="#" onClick={e => { e.preventDefault(); setSection('gallery-list'); }}>
          <i className="fa fa-picture-o" style={{ marginRight: 6 }} />Gallery
        </a>
      </li>
      <li className={section === 'cat-list' ? 'active' : ''}>
        <a href="#" onClick={e => { e.preventDefault(); setSection('cat-list'); }}>
          <i className="fa fa-tags" style={{ marginRight: 6 }} />Gallery Category
        </a>
      </li>
    </ul>
  );

  /* ── GALLERY LIST (default) ── */
  if (section === 'gallery-list') {
    return (
      <AdminDataTable<GalleryItem>
        title="Gallery"
        breadcrumb={[{ label: 'Gallery' }]}
        addButton={{ label: 'Add New Gallery', onClick: () => { setGalForm(BLANK_GAL); setGalMsg(null); setSection('gallery-add'); } }}
        sectionTitle="List Gallery"
        subHeader={sectionTabs}
        extraButton={
          <a href="/portal" target="_blank" className="btn btn-primary btn-sm">
            <i className="fa fa-eye" style={{ marginRight: 4 }} />View on Frontend
          </a>
        }
        rows={galleries}
        rowKey={r => r.id!}
        searchKeys={['title', 'alias']}
        columns={[
          { header: 'Id', cell: r => r.id, sortKey: 'id', width: 60 },
          { header: 'Title', cell: r => r.title, sortKey: 'title' },
          { header: 'Alias', cell: r => <code>{r.alias}</code>, sortKey: 'alias' },
          {
            header: 'Category', width: 160,
            cell: r => categories.find(c => c.id === r.category)?.name ?? '—',
          },
          {
            header: 'Date', width: 130,
            cell: r => r.date ? new Date(r.date).toDateString() : '—',
          },
          {
            header: 'Status', width: 100,
            cell: r => <StatusBadge value={r.status === '1'} />,
          },
        ]}
        onEdit={openEditGallery}
        onDelete={async r => {
          if (!confirm(`Delete gallery "${r.title}"?`)) return;
          await apiFetch(`/galleries/${r.id}`, { method: 'DELETE' });
          await load();
        }}
      />
    );
  }

  /* ── GALLERY CATEGORY LIST ── */
  return (
    <AdminDataTable<Category>
      title="Gallery Category"
      breadcrumb={[{ label: 'Gallery Category' }]}
      addButton={{ label: 'Add New Category', onClick: () => { setCatForm(BLANK_CAT); setCatMsg(null); setSection('cat-add'); } }}
      sectionTitle="List Category"
      subHeader={sectionTabs}
      rows={categories}
      rowKey={r => r.id}
      searchKeys={['name', 'alias']}
      columns={[
        { header: 'Id', cell: r => r.id, sortKey: 'id', width: 60 },
        { header: 'Name', cell: r => r.name, sortKey: 'name' },
        { header: 'Alias', cell: r => <code>{r.alias}</code>, sortKey: 'alias' },
        { header: 'Sort Order', cell: r => r.sortorder, sortKey: 'sortorder', width: 110 },
      ]}
      onEdit={r => { setCatForm({ ...r }); setCatMsg(null); setSection('cat-edit'); }}
      onDelete={async r => {
        if (!confirm(`Delete category "${r.name}"?`)) return;
        await apiFetch(`/galleries/categories/${r.id}`, { method: 'DELETE' });
        await load();
      }}
    />
  );
}
