'use client';
/**
 * /admin/acl — Role Management dashboard (Super Admin only).
 *
 * Two tabs:
 *   • Roles      — list + create + edit + delete + member-count column
 *   • Categories — inline-editable list of acl_category rows
 *
 * Clicking a row navigates to /admin/acl/[id] for the per-role detail page.
 */
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/auth';

interface Role {
  roleId: number;
  name?: string;
  roleCategory?: number | null;
  isFixed?: '0' | '1';
  storeId?: number;
  memberCount?: number;
}
interface Category {
  id: number;
  categoryName?: string;
}

type Tab = 'roles' | 'categories';

export default function AdminAclPage() {
  const [tab, setTab] = useState<Tab>('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState({ q: '', categoryId: 0 });
  const [loading, setLoading] = useState(true);

  // create role modal state
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', roleCategory: 0, isFixed: '0' as '0' | '1' });

  // create category state
  const [newCat, setNewCat] = useState('');
  const [editCatId, setEditCatId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([
        apiFetch<Role[]>(buildRolesQuery(filter)).catch(() => []),
        apiFetch<Category[]>('/acl/categories').catch(() => []),
      ]);
      setRoles(Array.isArray(r) ? r : []);
      setCategories(Array.isArray(c) ? c : []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const categoryMap = useMemo(() => {
    const m = new Map<number, string>();
    categories.forEach(c => m.set(c.id, c.categoryName ?? ''));
    return m;
  }, [categories]);

  async function saveNewRole() {
    if (!newRole.name.trim()) return;
    await apiFetch('/acl/roles', {
      method: 'POST',
      body: JSON.stringify({
        name: newRole.name.trim(),
        roleCategory: newRole.roleCategory || undefined,
        isFixed: newRole.isFixed,
        storeId: 1,
      }),
    });
    setNewRole({ name: '', roleCategory: 0, isFixed: '0' });
    setShowAddRole(false);
    load();
  }

  async function deleteRole(r: Role) {
    if (!confirm(`Delete role "${r.name}"? This removes all member + resource assignments.`)) return;
    try {
      await apiFetch(`/acl/roles/${r.roleId}`, { method: 'DELETE' });
      load();
    } catch (e: any) {
      alert(e?.message ?? 'Could not delete role');
    }
  }

  async function saveNewCategory() {
    const name = newCat.trim();
    if (!name) return;
    await apiFetch('/acl/categories', { method: 'POST', body: JSON.stringify({ categoryName: name }) });
    setNewCat('');
    load();
  }

  async function saveCategoryEdit() {
    if (editCatId == null) return;
    await apiFetch(`/acl/categories/${editCatId}`, {
      method: 'PUT',
      body: JSON.stringify({ categoryName: editCatName.trim() }),
    });
    setEditCatId(null);
    load();
  }

  async function deleteCategory(c: Category) {
    if (!confirm(`Delete category "${c.categoryName}"?`)) return;
    try {
      await apiFetch(`/acl/categories/${c.id}`, { method: 'DELETE' });
      load();
    } catch (e: any) {
      alert(e?.message ?? 'Could not delete (in use?)');
    }
  }

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      {/* Page heading */}
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h5 style={{ margin: 0 }}>
                <i className="fa fa-key" style={{ marginRight: 8, color: '#e2231a' }} />
                Role Management
              </h5>
            </div>
            <div className="ibox-content" style={{ padding: '0 16px' }}>
              <ul style={tabsUl}>
                <TabBtn label="Roles" icon="fa-users" active={tab === 'roles'} onClick={() => setTab('roles')} />
                <TabBtn label="Categories" icon="fa-tags" active={tab === 'categories'} onClick={() => setTab('categories')} />
              </ul>
            </div>
          </div>
        </div>
      </div>

      {tab === 'roles' && (
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h5 style={{ margin: 0 }}>Roles ({roles.length})</h5>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Search by name…"
                    value={filter.q}
                    onChange={(e) => setFilter(f => ({ ...f, q: e.target.value }))}
                    style={input}
                  />
                  <select
                    value={filter.categoryId}
                    onChange={(e) => setFilter(f => ({ ...f, categoryId: +e.target.value }))}
                    style={input}
                  >
                    <option value={0}>All categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                  </select>
                  <button style={btnPrimary} onClick={() => setShowAddRole(true)}>
                    <i className="fa fa-plus" style={{ marginRight: 5 }} />New Role
                  </button>
                </div>
              </div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {loading ? (
                  <div style={{ padding: 32, textAlign: 'center' }}>
                    <i className="fa fa-spinner fa-spin" />
                  </div>
                ) : roles.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No roles found.</p>
                ) : (
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={th}>#</th>
                        <th style={th}>Role name</th>
                        <th style={th}>Category</th>
                        <th style={th}>Fixed?</th>
                        <th style={th}>Members</th>
                        <th style={{ ...th, width: 200 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(r => (
                        <tr key={r.roleId}>
                          <td style={td}>{r.roleId}</td>
                          <td style={{ ...td, fontWeight: 600 }}>{r.name}</td>
                          <td style={td}>{r.roleCategory ? categoryMap.get(r.roleCategory) ?? `#${r.roleCategory}` : <em style={{ color: '#aaa' }}>—</em>}</td>
                          <td style={td}>
                            {r.isFixed === '1'
                              ? <span style={badge('#1ab394')}>Fixed</span>
                              : <span style={badge('#e0e0e0', '#666')}>Editable</span>}
                          </td>
                          <td style={td}>
                            <span style={badge('#1c84c6')}>{r.memberCount ?? 0}</span>
                          </td>
                          <td style={td}>
                            <Link href={`/admin/acl/${r.roleId}`} style={{ ...btnSmall('#1c84c6'), marginRight: 6 }}>
                              <i className="fa fa-edit" style={{ marginRight: 4 }} />Edit
                            </Link>
                            <button
                              style={btnSmall(r.isFixed === '1' || r.roleId === 9 ? '#bbb' : '#ed5565')}
                              disabled={r.isFixed === '1' || r.roleId === 9}
                              onClick={() => deleteRole(r)}
                              title={r.isFixed === '1' ? 'Fixed role; cannot delete' : (r.roleId === 9 ? 'Super Admin role is protected' : 'Delete role')}
                            >
                              <i className="fa fa-trash" />
                            </button>
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

      {tab === 'categories' && (
        <div className="row">
          <div className="col-lg-8 col-md-10">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>Role Categories ({categories.length})</h5>
              </div>
              <div className="ibox-content">
                {/* Add row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input
                    type="text"
                    placeholder="New category name"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    style={{ ...input, flex: 1 }}
                  />
                  <button style={btnPrimary} onClick={saveNewCategory}>
                    <i className="fa fa-plus" style={{ marginRight: 5 }} />Add
                  </button>
                </div>

                {categories.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>No categories yet.</p>
                ) : (
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={th}>#</th>
                        <th style={th}>Category name</th>
                        <th style={{ ...th, width: 200 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(c => (
                        <tr key={c.id}>
                          <td style={td}>{c.id}</td>
                          <td style={td}>
                            {editCatId === c.id ? (
                              <input
                                style={input}
                                value={editCatName}
                                onChange={(e) => setEditCatName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveCategoryEdit()}
                                autoFocus
                              />
                            ) : (
                              <span style={{ fontWeight: 600 }}>{c.categoryName}</span>
                            )}
                          </td>
                          <td style={td}>
                            {editCatId === c.id ? (
                              <>
                                <button style={{ ...btnSmall('#1ab394'), marginRight: 6 }} onClick={saveCategoryEdit}>
                                  <i className="fa fa-check" />
                                </button>
                                <button style={btnSmall('#bbb')} onClick={() => setEditCatId(null)}>
                                  <i className="fa fa-times" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  style={{ ...btnSmall('#1c84c6'), marginRight: 6 }}
                                  onClick={() => { setEditCatId(c.id); setEditCatName(c.categoryName ?? ''); }}
                                >
                                  <i className="fa fa-edit" />
                                </button>
                                <button style={btnSmall('#ed5565')} onClick={() => deleteCategory(c)}>
                                  <i className="fa fa-trash" />
                                </button>
                              </>
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

      {/* New role modal */}
      {showAddRole && (
        <div style={modalOverlay} onClick={() => setShowAddRole(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginTop: 0 }}>New Role</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                style={input}
                placeholder="Role name"
                value={newRole.name}
                onChange={(e) => setNewRole(r => ({ ...r, name: e.target.value }))}
                autoFocus
              />
              <select
                style={input}
                value={newRole.roleCategory}
                onChange={(e) => setNewRole(r => ({ ...r, roleCategory: +e.target.value }))}
              >
                <option value={0}>— No category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
              </select>
              <label style={{ fontSize: 13, color: '#555' }}>
                <input
                  type="checkbox"
                  checked={newRole.isFixed === '1'}
                  onChange={(e) => setNewRole(r => ({ ...r, isFixed: e.target.checked ? '1' : '0' }))}
                  style={{ marginRight: 6 }}
                />
                Fixed (cannot be deleted later)
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button style={btnSmall('#bbb')} onClick={() => setShowAddRole(false)}>Cancel</button>
                <button style={btnPrimary} onClick={saveNewRole} disabled={!newRole.name.trim()}>
                  <i className="fa fa-save" style={{ marginRight: 5 }} />Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────────

function buildRolesQuery(filter: { q: string; categoryId: number }) {
  const params = new URLSearchParams();
  if (filter.q.trim()) params.set('q', filter.q.trim());
  if (filter.categoryId) params.set('categoryId', String(filter.categoryId));
  const qs = params.toString();
  return qs ? `/acl/roles?${qs}` : '/acl/roles';
}

function TabBtn({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <li style={{ flexShrink: 0, listStyle: 'none' }}>
      <button
        onClick={onClick}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 20px', fontSize: 13, fontWeight: 600,
          color: active ? '#e2231a' : '#676a6c',
          borderBottom: active ? '2px solid #e2231a' : '2px solid transparent',
          marginBottom: -2,
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <i className={`fa ${icon}`} />{label}
      </button>
    </li>
  );
}

const tabsUl: React.CSSProperties = {
  display: 'flex', listStyle: 'none', padding: 0, margin: 0,
  borderBottom: '2px solid #e5e5e5',
};
const th: React.CSSProperties = { padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#555' };
const td: React.CSSProperties = { padding: '10px 16px', verticalAlign: 'middle', fontSize: 13 };
const input: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc',
  fontSize: 13, outline: 'none', minWidth: 140,
};
const btnPrimary: React.CSSProperties = {
  background: '#e2231a', color: '#fff', border: 'none', borderRadius: 4,
  padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
function btnSmall(color: string): React.CSSProperties {
  return {
    background: color, color: '#fff', border: 'none', borderRadius: 3,
    padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center',
  };
}
function badge(bg: string, fg = '#fff'): React.CSSProperties {
  return {
    background: bg, color: fg, borderRadius: 10,
    padding: '2px 10px', fontSize: 11, fontWeight: 700,
    display: 'inline-block',
  };
}
const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalBox: React.CSSProperties = {
  background: '#fff', borderRadius: 6, padding: 24,
  width: '100%', maxWidth: 420, boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
};
