'use client';
/**
 * /admin/acl/[id] — Role detail (Super Admin only).
 *
 * Three tabs:
 *   • Details      — edit name + category + isFixed
 *   • Members      — assign / remove employees from the role
 *   • Resources    — list/add/remove route+action permissions
 */
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface Role {
  roleId: number;
  name?: string;
  roleCategory?: number | null;
  isFixed?: '0' | '1';
  storeId?: number;
}
interface Category { id: number; categoryName?: string }
interface Member {
  userId: number;
  ecode?: string;
  name?: string;
  email?: string;
  designation?: string;
}
interface Resource {
  resourceId: number;
  roleId: number;
  routeName?: string;
  action?: string;
  type?: '0' | '1';
}
interface Employee {
  id?: number;
  userId?: number;
  ecode?: string;
  name?: string;
  email?: string;
  designation?: string;
}

type Tab = 'details' | 'members' | 'resources';

export default function AdminAclRolePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roleId = Number(params.id);

  const [tab, setTab] = useState<Tab>('details');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // employee search for adding members
  const [empQuery, setEmpQuery] = useState('');
  const [empResults, setEmpResults] = useState<Employee[]>([]);
  const [empSearching, setEmpSearching] = useState(false);

  // new resource form
  const [newRes, setNewRes] = useState({ routeName: '', action: 'index', type: '0' as '0' | '1' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, cats, mems, res] = await Promise.all([
        apiFetch<{ role: Role }>(`/acl/roles/${roleId}`).catch(() => null),
        apiFetch<Category[]>('/acl/categories').catch(() => []),
        apiFetch<Member[]>(`/acl/roles/${roleId}/members`).catch(() => []),
        apiFetch<Resource[]>(`/acl/roles/${roleId}/resources`).catch(() => []),
      ]);
      setRole(detail?.role ?? null);
      setCategories(Array.isArray(cats) ? cats : []);
      setMembers(Array.isArray(mems) ? mems : []);
      setResources(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => { load(); }, [load]);

  // ── Details tab actions ───────────────────────────────────────────────

  async function saveDetails() {
    if (!role) return;
    setSaving(true);
    try {
      await apiFetch(`/acl/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: role.name,
          roleCategory: role.roleCategory ?? undefined,
          isFixed: role.isFixed ?? '0',
        }),
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } finally { setSaving(false); }
  }

  // ── Member tab actions ─────────────────────────────────────────────────

  const memberIds = useMemo(() => new Set(members.map(m => m.userId)), [members]);

  async function searchEmployees() {
    const q = empQuery.trim();
    if (!q) { setEmpResults([]); return; }
    setEmpSearching(true);
    try {
      const data = await apiFetch<{ items: Employee[] }>(
        `/employees?q=${encodeURIComponent(q)}&pageSize=20`,
      ).catch(() => ({ items: [] as Employee[] }));
      setEmpResults(data.items ?? []);
    } finally { setEmpSearching(false); }
  }

  async function addMember(emp: Employee) {
    const uid = emp.userId ?? emp.id;
    if (!uid) return;
    await apiFetch(`/acl/roles/${roleId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId: uid }),
    });
    load();
  }

  async function removeMember(m: Member) {
    if (!confirm(`Remove ${m.name ?? m.ecode ?? 'user'} from this role?`)) return;
    await apiFetch(`/acl/roles/${roleId}/members/${m.userId}`, { method: 'DELETE' });
    load();
  }

  // ── Resource tab actions ───────────────────────────────────────────────

  async function addResource() {
    if (!newRes.routeName.trim() || !newRes.action.trim()) return;
    await apiFetch(`/acl/roles/${roleId}/resources`, {
      method: 'POST',
      body: JSON.stringify({
        routeName: newRes.routeName.trim(),
        action: newRes.action.trim(),
        type: newRes.type,
      }),
    });
    setNewRes({ routeName: '', action: 'index', type: '0' });
    load();
  }

  async function deleteResource(r: Resource) {
    if (!confirm(`Remove permission "${r.routeName}.${r.action}"?`)) return;
    await apiFetch(`/acl/resources/${r.resourceId}`, { method: 'DELETE' });
    load();
  }

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div style={{ textAlign: 'center', padding: 80 }}>
          <i className="fa fa-spinner fa-spin" style={{ fontSize: 28, color: '#e2231a' }} />
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="ibox-content" style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
          <i className="fa fa-exclamation-triangle" style={{ fontSize: 30, marginBottom: 12 }} />
          <p>Role not found.</p>
          <Link href="/admin/acl" style={{ color: '#e2231a' }}>← Back to roles</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      {/* Header */}
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h5 style={{ margin: 0 }}>
                <Link href="/admin/acl" style={{ color: '#888', marginRight: 8 }}>← Roles</Link>
                <i className="fa fa-key" style={{ marginRight: 6, color: '#e2231a' }} />
                {role.name} <small style={{ color: '#aaa' }}>#{role.roleId}</small>
              </h5>
              {role.isFixed === '1' && <span style={badge('#1ab394')}>Fixed</span>}
            </div>
            <div className="ibox-content" style={{ padding: '0 16px' }}>
              <ul style={tabsUl}>
                <TabBtn label="Details" icon="fa-info-circle" active={tab === 'details'} onClick={() => setTab('details')} />
                <TabBtn label={`Members (${members.length})`} icon="fa-users" active={tab === 'members'} onClick={() => setTab('members')} />
                <TabBtn label={`Resources (${resources.length})`} icon="fa-cog" active={tab === 'resources'} onClick={() => setTab('resources')} />
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      {tab === 'details' && (
        <div className="row">
          <div className="col-lg-8 col-md-10">
            <div className="ibox float-e-margins">
              <div className="ibox-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FormRow label="Role name">
                  <input
                    style={input}
                    value={role.name ?? ''}
                    onChange={(e) => setRole({ ...role, name: e.target.value })}
                  />
                </FormRow>
                <FormRow label="Category">
                  <select
                    style={input}
                    value={role.roleCategory ?? 0}
                    onChange={(e) => setRole({ ...role, roleCategory: +e.target.value || null })}
                  >
                    <option value={0}>— No category —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                  </select>
                </FormRow>
                <FormRow label="Fixed?">
                  <label style={{ fontSize: 13, color: '#555' }}>
                    <input
                      type="checkbox"
                      checked={role.isFixed === '1'}
                      onChange={(e) => setRole({ ...role, isFixed: e.target.checked ? '1' : '0' })}
                      style={{ marginRight: 6 }}
                    />
                    Fixed role (cannot be deleted)
                  </label>
                </FormRow>
                <FormRow label="Store">
                  <input style={{ ...input, background: '#f4f4f4' }} value={`Store #${role.storeId ?? 1}`} disabled />
                </FormRow>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button style={btnPrimary} onClick={saveDetails} disabled={saving}>
                    {saving ? (<><i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }} />Saving…</>)
                            : (<><i className="fa fa-save" style={{ marginRight: 6 }} />Save changes</>)}
                  </button>
                  {savedFlash && <span style={{ color: '#1ab394', fontSize: 13, alignSelf: 'center' }}>✓ Saved</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members */}
      {tab === 'members' && (
        <div className="row">
          <div className="col-md-7">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>Current members ({members.length})</h5>
              </div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {members.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>No members yet.</p>
                ) : (
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={th}>Ecode</th>
                        <th style={th}>Name</th>
                        <th style={th}>Email</th>
                        <th style={{ ...th, width: 80 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.userId}>
                          <td style={td}>{m.ecode ?? '—'}</td>
                          <td style={{ ...td, fontWeight: 600 }}>{m.name ?? '—'}</td>
                          <td style={{ ...td, fontSize: 12, color: '#777' }}>{m.email ?? ''}</td>
                          <td style={td}>
                            <button style={btnSmall('#ed5565')} onClick={() => removeMember(m)} title="Remove">
                              <i className="fa fa-times" />
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

          <div className="col-md-5">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>Add member</h5>
              </div>
              <div className="ibox-content">
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    style={{ ...input, flex: 1 }}
                    placeholder="Search by name, ecode, or email"
                    value={empQuery}
                    onChange={(e) => setEmpQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchEmployees()}
                  />
                  <button style={btnPrimary} onClick={searchEmployees} disabled={empSearching}>
                    <i className="fa fa-search" />
                  </button>
                </div>

                {empSearching ? (
                  <p style={{ textAlign: 'center', color: '#888' }}>Searching…</p>
                ) : empResults.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                    {empQuery.trim() ? 'No results.' : 'Search to find employees.'}
                  </p>
                ) : (
                  <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid #eee', borderRadius: 4 }}>
                    {empResults.map(emp => {
                      const uid = emp.userId ?? emp.id;
                      const already = uid != null && memberIds.has(uid);
                      return (
                        <div
                          key={uid}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 12px', borderBottom: '1px solid #f4f4f4',
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              {emp.name} <span style={{ color: '#888' }}>({emp.ecode})</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#aaa' }}>{emp.email}</div>
                          </div>
                          <button
                            style={btnSmall(already ? '#bbb' : '#1ab394')}
                            disabled={already}
                            onClick={() => addMember(emp)}
                          >
                            {already ? '✓ Member' : '+ Add'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources */}
      {tab === 'resources' && (
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>Permissions ({resources.length})</h5>
              </div>
              <div className="ibox-content">
                {/* Add row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 16,
                }}>
                  <input
                    placeholder="Route name (e.g. cms/index)"
                    style={input}
                    value={newRes.routeName}
                    onChange={(e) => setNewRes(r => ({ ...r, routeName: e.target.value }))}
                  />
                  <input
                    placeholder="Action (e.g. index, edit)"
                    style={input}
                    value={newRes.action}
                    onChange={(e) => setNewRes(r => ({ ...r, action: e.target.value }))}
                  />
                  <select
                    style={input}
                    value={newRes.type}
                    onChange={(e) => setNewRes(r => ({ ...r, type: e.target.value as '0' | '1' }))}
                  >
                    <option value="0">Backend</option>
                    <option value="1">Frontend</option>
                  </select>
                  <button style={btnPrimary} onClick={addResource}>
                    <i className="fa fa-plus" style={{ marginRight: 5 }} />Add
                  </button>
                </div>

                {resources.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>No resources granted.</p>
                ) : (
                  <table className="table table-hover" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={th}>#</th>
                        <th style={th}>Route name</th>
                        <th style={th}>Action</th>
                        <th style={th}>Type</th>
                        <th style={{ ...th, width: 80 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map(r => (
                        <tr key={r.resourceId}>
                          <td style={td}>{r.resourceId}</td>
                          <td style={{ ...td, fontFamily: 'monospace' }}>{r.routeName}</td>
                          <td style={{ ...td, fontFamily: 'monospace' }}>{r.action}</td>
                          <td style={td}>
                            {r.type === '1' ? <span style={badge('#23c6c8')}>Frontend</span> : <span style={badge('#7266ba')}>Backend</span>}
                          </td>
                          <td style={td}>
                            <button style={btnSmall('#ed5565')} onClick={() => deleteResource(r)}>
                              <i className="fa fa-times" />
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
    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────────

function TabBtn({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <li style={{ flexShrink: 0, listStyle: 'none' }}>
      <button
        onClick={onClick}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 18px', fontSize: 13, fontWeight: 600,
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

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <label style={{ width: 130, fontSize: 13, fontWeight: 600, color: '#555' }}>{label}</label>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const tabsUl: React.CSSProperties = {
  display: 'flex', listStyle: 'none', padding: 0, margin: 0,
  borderBottom: '2px solid #e5e5e5', flexWrap: 'wrap',
};
const th: React.CSSProperties = { padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#555' };
const td: React.CSSProperties = { padding: '10px 16px', verticalAlign: 'middle', fontSize: 13 };
const input: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc',
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
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
