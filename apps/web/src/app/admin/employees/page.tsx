'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Employee {
  userId: number;
  ecode?: string;
  name?: string;
  email?: string;
  department?: number;
  location?: number;
  designation?: string;
  grade?: string;
  profilepic?: string;
}

interface Dept { id: number; name: string; }
interface Loc { id: number; name: string; }

const PAGE_SIZES = [10, 25, 50, 100];

export default function EmployeesAdmin() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [locations, setLocations] = useState<Loc[]>([]);
  const [filters, setFilters] = useState({ q: '', departmentId: '', locationId: '', grade: '' });
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiFetch<Dept[]>('/employees/departments').then(setDepartments).catch(() => {});
    apiFetch<Loc[]>('/employees/locations').then(setLocations).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.departmentId) params.set('departmentId', filters.departmentId);
      if (filters.locationId) params.set('locationId', filters.locationId);
      if (filters.grade) params.set('grade', filters.grade);
      params.set('pageSize', '500');
      const res = await apiFetch<{ items: Employee[] } | Employee[]>(`/employees?${params.toString()}`);
      const items = Array.isArray(res) ? res : (res as any).items ?? [];
      setRows(items);
      setPage(1);
    } catch { setRows([]); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  // Client-side text filter on top of server results
  const filtered = rows.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.name ?? '').toLowerCase().includes(q) ||
      (r.ecode ?? '').toLowerCase().includes(q) ||
      (r.email ?? '').toLowerCase().includes(q) ||
      (r.designation ?? '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleReset() {
    setFilters({ q: '', departmentId: '', locationId: '', grade: '' });
    setSearch('');
    setPage(1);
  }

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>Employees</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Home</Link></li>
            <li className="active">Employees</li>
          </ol>
        </div>
      </div>

      {/* Filters sub-bar */}
      <div className="wrapper wrapper-content" style={{ paddingBottom: 0 }}>
        <div className="ibox float-e-margins" style={{ marginBottom: 0 }}>
          <div className="ibox-content" style={{ padding: '12px 16px' }}>
            <div className="row">
              <div className="col-sm-3">
                <select
                  className="form-control input-sm"
                  value={filters.departmentId}
                  onChange={e => setFilters(f => ({ ...f, departmentId: e.target.value }))}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="col-sm-3">
                <select
                  className="form-control input-sm"
                  value={filters.locationId}
                  onChange={e => setFilters(f => ({ ...f, locationId: e.target.value }))}
                >
                  <option value="">All Locations</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="col-sm-2">
                <input
                  className="form-control input-sm"
                  placeholder="Grade"
                  value={filters.grade}
                  onChange={e => setFilters(f => ({ ...f, grade: e.target.value }))}
                />
              </div>
              <div className="col-sm-2">
                <button className="btn btn-primary btn-sm btn-block" onClick={load}>
                  <i className="fa fa-search" style={{ marginRight: 4 }} />Search
                </button>
              </div>
              <div className="col-sm-2">
                <button className="btn btn-warning btn-sm btn-block" onClick={handleReset}>Reset</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="wrapper wrapper-content animated fadeInRight" style={{ paddingTop: 8 }}>
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>
                  Employee Directory
                  <small style={{ marginLeft: 8, color: '#999' }}>({filtered.length} records)</small>
                </h5>
              </div>
              <div className="ibox-content">
                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Show</span>
                    <select
                      className="form-control input-sm"
                      style={{ width: 70, display: 'inline-block' }}
                      value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                    >
                      {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>entries</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ margin: 0 }}>Search:</label>
                    <input
                      className="form-control input-sm"
                      style={{ width: 200 }}
                      placeholder="Name / E-code / Email..."
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                  </div>
                </div>

                {/* Table */}
                <table className="table table-striped table-bordered table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: 100 }}>E-Code</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Designation</th>
                      <th style={{ width: 80 }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>No employees found.</td>
                      </tr>
                    ) : paged.map(r => (
                      <tr key={r.userId}>
                        <td style={{ verticalAlign: 'middle' }}>
                          <code>{r.ecode}</code>
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {r.profilepic && (
                              <img
                                src={r.profilepic}
                                alt={r.name}
                                style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                              />
                            )}
                            {r.name}
                          </div>
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>{r.email}</td>
                        <td style={{ verticalAlign: 'middle' }}>{r.designation}</td>
                        <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                          {r.grade && (
                            <span className="label label-default">{r.grade}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div style={{ fontSize: 13, color: '#676a6c' }}>
                    {filtered.length === 0
                      ? 'No entries'
                      : `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length} entries`}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="btn btn-default btn-xs"
                      disabled={safePage === 1}
                      onClick={() => setPage(p => p - 1)}
                    >Previous</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const n = i + 1;
                      return (
                        <button
                          key={n}
                          className={`btn btn-xs ${safePage === n ? 'btn-primary' : 'btn-default'}`}
                          onClick={() => setPage(n)}
                        >{n}</button>
                      );
                    })}
                    <button
                      className="btn btn-default btn-xs"
                      disabled={safePage === totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >Next</button>
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
