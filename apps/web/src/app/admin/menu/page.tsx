'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface MenuItem {
  id: number;
  menuName: string;
  parentId: number;
  url: string;
  menuType: '0' | '1';
  class: string;
  tagName: string;
  position: '0' | '1' | '2';
  active: '0' | '1';
  roleId: number | null;
  newWindow: '0' | '1';
  ordering: number;
  store: number;
  module: number | null;
}

interface CmsPage { id: number; title: string; alias: string; }

type Position = '0' | '1';

const BLANK: Partial<MenuItem> = {
  menuName: '', url: '', menuType: '0', class: '', tagName: '',
  position: '0', active: '1', roleId: null, newWindow: '0', ordering: 0,
  parentId: 0, store: 1, module: null,
};

function buildTree(items: MenuItem[], parentId = 0): MenuItem[] {
  return items
    .filter((m) => m.parentId === parentId)
    .sort((a, b) => a.ordering - b.ordering);
}

function TreeItem({
  item, allItems, depth, onSelect, selectedId,
}: {
  item: MenuItem; allItems: MenuItem[]; depth: number;
  onSelect: (item: MenuItem) => void; selectedId?: number;
}) {
  const children = buildTree(allItems, item.id);
  return (
    <div>
      <div
        className={`dd-item`}
        style={{
          display: 'flex', alignItems: 'center', gap: 0,
          borderBottom: '1px solid #e7eaec',
          background: selectedId === item.id ? '#eaf7f5' : 'white',
          marginLeft: depth * 20,
        }}
      >
        {/* collapse/expand (visual only) */}
        {children.length > 0 ? (
          <span style={{ width: 28, textAlign: 'center', color: '#999', cursor: 'default' }}>-</span>
        ) : (
          <span style={{ width: 28 }} />
        )}
        {/* drag handle */}
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, background: '#1ab394', color: 'white',
            cursor: 'grab', flexShrink: 0,
          }}
        >
          <i className="fa fa-bars" />
        </span>
        {/* name */}
        <span style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}>{item.menuName}</span>
        {/* gear to edit */}
        <button
          style={{
            width: 34, height: 34, border: 0, background: 'transparent',
            color: '#1ab394', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => onSelect(item)}
          title="Edit"
        >
          <i className="fa fa-cog" style={{ fontSize: 14 }} />
        </button>
      </div>
      {children.map((child) => (
        <TreeItem
          key={child.id}
          item={child}
          allItems={allItems}
          depth={depth + 1}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}

export default function MenuAdminPage() {
  const [position, setPosition] = useState<Position>('0');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cmsPages, setCmsPages] = useState<CmsPage[]>([]);
  const [form, setForm] = useState<Partial<MenuItem>>(BLANK);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await apiFetch<MenuItem[]>(`/menus/admin?store=1`);
      setItems(all);
    } catch { setItems([]); }
    try {
      const pages = await apiFetch<CmsPage[]>('/cms/pages?store=1&status=1');
      setCmsPages(Array.isArray(pages) ? pages : []);
    } catch { setCmsPages([]); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function selectItem(item: MenuItem) {
    setForm({ ...item });
    setMsg(null);
  }

  function newItem() {
    setForm({ ...BLANK, position });
    setMsg(null);
  }

  async function save() {
    if (!form.menuName?.trim()) { setMsg({ type: 'danger', text: 'Menu Name is required.' }); return; }
    setSaving(true);
    try {
      const body = { store: 1, ...form, position: form.position ?? position };
      if (form.id) await apiFetch(`/menus/${form.id}`, { method: 'PUT', body: JSON.stringify(body) });
      else await apiFetch('/menus', { method: 'POST', body: JSON.stringify(body) });
      setMsg({ type: 'success', text: 'Saved successfully.' });
      setForm(BLANK);
      await load();
    } catch {
      setMsg({ type: 'danger', text: 'Error saving menu item.' });
    } finally { setSaving(false); }
  }

  async function deleteItem(item: MenuItem) {
    if (!confirm(`Delete menu "${item.menuName}"?`)) return;
    await apiFetch(`/menus/${item.id}`, { method: 'DELETE' });
    setForm(BLANK);
    await load();
  }

  const filtered = items.filter((m) => m.position === position);
  const roots = buildTree(filtered, 0);

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>Edit Menu</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Home</Link></li>
            <li className="active">Menu</li>
          </ol>
        </div>
        <div className="col-sm-4" style={{ paddingTop: 20, textAlign: 'right' }}>
          <Link href="/admin" className="btn btn-white btn-sm">
            <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="row">
          {/* Left: Tree */}
          <div className="col-lg-8">
            <div className="ibox float-e-margins">
              <div className="ibox-content">
                {/* Position tabs */}
                <ul className="nav nav-tabs" style={{ marginBottom: 16 }}>
                  <li className={position === '0' ? 'active' : ''}>
                    <a href="#" onClick={e => { e.preventDefault(); setPosition('0'); setForm(BLANK); }}>Header</a>
                  </li>
                  <li className={position === '1' ? 'active' : ''}>
                    <a href="#" onClick={e => { e.preventDefault(); setPosition('1'); setForm(BLANK); }}>Sidebar</a>
                  </li>
                </ul>

                {/* Tree */}
                <div style={{ border: '1px solid #e7eaec', borderRadius: 4, overflow: 'hidden' }}>
                  {roots.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>No menu items.</div>
                  ) : roots.map((item) => (
                    <TreeItem
                      key={item.id}
                      item={item}
                      allItems={filtered}
                      depth={0}
                      onSelect={selectItem}
                      selectedId={form.id}
                    />
                  ))}
                </div>

                {/* Add button */}
                <div style={{ marginTop: 12, textAlign: 'right' }}>
                  <button className="btn btn-primary btn-sm" onClick={newItem}>
                    <i className="fa fa-plus" style={{ marginRight: 4 }} />Add New Item
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="col-lg-4">
            <div className="ibox float-e-margins">
              <div className="ibox-content">
                {msg && (
                  <div className={`alert alert-${msg.type}`} style={{ padding: '8px 12px', fontSize: 13 }}>
                    {msg.text}
                  </div>
                )}
                <div className="form-horizontal">
                  {/* Menu Name */}
                  <div className="form-group">
                    <label className="col-sm-4 control-label">Menu Name</label>
                    <div className="col-sm-8">
                      <input
                        className="form-control input-sm"
                        value={form.menuName ?? ''}
                        onChange={e => setForm(f => ({ ...f, menuName: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="form-group">
                    <label className="col-sm-4 control-label">Tags</label>
                    <div className="col-sm-8">
                      <textarea
                        className="form-control input-sm"
                        rows={2}
                        value={form.tagName ?? ''}
                        onChange={e => setForm(f => ({ ...f, tagName: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Menu Type */}
                  <div className="form-group">
                    <label className="col-sm-4 control-label">Menu Type</label>
                    <div className="col-sm-8">
                      <label style={{ marginRight: 12, fontWeight: 'normal' }}>
                        <input
                          type="radio" name="menuType" value="0" style={{ marginRight: 4 }}
                          checked={form.menuType === '0'}
                          onChange={() => setForm(f => ({ ...f, menuType: '0' }))}
                        />Internal
                      </label>
                      <label style={{ fontWeight: 'normal' }}>
                        <input
                          type="radio" name="menuType" value="1" style={{ marginRight: 4 }}
                          checked={form.menuType === '1'}
                          onChange={() => setForm(f => ({ ...f, menuType: '1' }))}
                        />External
                      </label>
                    </div>
                  </div>

                  {/* CMS Pages (only for Internal) */}
                  {form.menuType === '0' && (
                    <div className="form-group">
                      <label className="col-sm-4 control-label">Cms Pages</label>
                      <div className="col-sm-8">
                        <select
                          className="form-control input-sm"
                          value={form.module ?? ''}
                          onChange={e => setForm(f => ({ ...f, module: e.target.value ? Number(e.target.value) : null, url: '' }))}
                        >
                          <option value="">-- Please Select --</option>
                          {cmsPages.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* URL (for External) */}
                  {form.menuType === '1' && (
                    <div className="form-group">
                      <label className="col-sm-4 control-label">URL</label>
                      <div className="col-sm-8">
                        <input
                          className="form-control input-sm"
                          placeholder="https://"
                          value={form.url ?? ''}
                          onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Class */}
                  <div className="form-group">
                    <label className="col-sm-4 control-label">Class</label>
                    <div className="col-sm-8">
                      <input
                        className="form-control input-sm"
                        placeholder="fa fa-laptop"
                        value={form.class ?? ''}
                        onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
                      />
                      <span style={{ fontSize: 11, color: '#999' }}>
                        Example: <strong>fa fa-laptop</strong>
                      </span>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="form-group">
                    <label className="col-sm-4 control-label">Position</label>
                    <div className="col-sm-8">
                      <label style={{ marginRight: 12, fontWeight: 'normal' }}>
                        <input
                          type="radio" name="position" value="0" style={{ marginRight: 4 }}
                          checked={form.position === '0'}
                          onChange={() => setForm(f => ({ ...f, position: '0' }))}
                        />Header
                      </label>
                      <label style={{ fontWeight: 'normal' }}>
                        <input
                          type="radio" name="position" value="1" style={{ marginRight: 4 }}
                          checked={form.position === '1'}
                          onChange={() => setForm(f => ({ ...f, position: '1' }))}
                        />Sidebar
                      </label>
                    </div>
                  </div>

                  {/* Active */}
                  <div className="form-group">
                    <label className="col-sm-4 control-label">Active</label>
                    <div className="col-sm-8">
                      <select
                        className="form-control input-sm"
                        value={form.active ?? '1'}
                        onChange={e => setForm(f => ({ ...f, active: e.target.value as '0' | '1' }))}
                      >
                        <option value="1">Enable</option>
                        <option value="0">Disable</option>
                      </select>
                    </div>
                  </div>

                  {/* Role Type */}
                  <div className="form-group">
                    <label className="col-sm-4 control-label">Role Type</label>
                    <div className="col-sm-8">
                      <select
                        className="form-control input-sm"
                        value={form.roleId ?? ''}
                        onChange={e => setForm(f => ({ ...f, roleId: e.target.value ? Number(e.target.value) : null }))}
                      >
                        <option value="">--All--</option>
                      </select>
                    </div>
                  </div>

                  {/* Open in New Window */}
                  <div className="form-group">
                    <label className="col-sm-4 control-label">Open in New Window</label>
                    <div className="col-sm-8">
                      <input
                        type="checkbox"
                        checked={form.newWindow === '1'}
                        onChange={e => setForm(f => ({ ...f, newWindow: e.target.checked ? '1' : '0' }))}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="form-group">
                    <div className="col-sm-offset-4 col-sm-8" style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={save}
                        disabled={saving}
                      >
                        <i className="fa fa-check" style={{ marginRight: 4 }} />
                        {saving ? 'Saving…' : form.id ? 'Update' : 'Save'}
                      </button>
                      {form.id && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteItem(form as MenuItem)}
                        >
                          <i className="fa fa-trash" style={{ marginRight: 4 }} />Delete
                        </button>
                      )}
                      <button
                        className="btn btn-white btn-sm"
                        onClick={() => { setForm(BLANK); setMsg(null); }}
                      >
                        Cancel
                      </button>
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
