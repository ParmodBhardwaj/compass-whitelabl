'use client';
import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';

export interface DTColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  sortKey?: keyof T;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

interface Props<T extends Record<string, any>> {
  /** Page-level title (h2) */
  title: string;
  /** Breadcrumb segments: [{label, href?}] */
  breadcrumb?: Array<{ label: string; href?: string }>;
  /** Label + href/onClick for the top-right "Add New" button */
  addButton?: { label: string; href?: string; onClick?: () => void };
  /** Section title inside the ibox (e.g. "List Banners") */
  sectionTitle?: string;
  /** Extra button shown top-right inside the ibox (e.g. "View on Frontend") */
  extraButton?: ReactNode;
  /** Sub-navigation rendered between page heading and the ibox (e.g. section tabs) */
  subHeader?: ReactNode;
  rows: T[];
  columns: DTColumn<T>[];
  rowKey: (row: T) => string | number;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  /** Whether to show a "View" button in the Actions column */
  onView?: (row: T) => void;
  /** Called when Reset button clicked — defaults to clearing search */
  onReset?: () => void;
  searchKeys?: Array<keyof T>;
}

const PAGE_SIZES = [10, 25, 50, 100];

export function AdminDataTable<T extends Record<string, any>>(props: Props<T>) {
  const {
    title, breadcrumb, addButton, sectionTitle, extraButton, subHeader,
    rows, columns, rowKey, onEdit, onDelete, onView, onReset, searchKeys,
  } = props;

  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) => {
      const keys = searchKeys ?? (Object.keys(row) as Array<keyof T>);
      return keys.some((k) => String(row[k] ?? '').toLowerCase().includes(q));
    });
  }, [rows, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSort(key: keyof T) {
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(key); setSortDir('asc'); }
    setPage(1);
  }

  function handleReset() {
    setSearch('');
    setPage(1);
    if (onReset) onReset();
  }

  const hasActions = !!(onEdit || onDelete || onView);

  return (
    <>
      {/* Page heading */}
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>{title}</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Home</Link></li>
            {(breadcrumb ?? []).map((b, i) => (
              <li key={i} className={i === (breadcrumb?.length ?? 0) - 1 ? 'active' : ''}>
                {b.href ? <Link href={b.href}>{b.label}</Link> : b.label}
              </li>
            ))}
          </ol>
        </div>
        <div className="col-sm-4" style={{ paddingTop: 24, textAlign: 'right' }}>
          {addButton && (
            addButton.href
              ? <Link href={addButton.href} className="btn btn-primary">{addButton.label}</Link>
              : <button className="btn btn-primary" onClick={addButton.onClick}>{addButton.label}</button>
          )}
        </div>
      </div>

      {/* Sub-navigation (optional section switcher) */}
      {subHeader && (
        <div className="wrapper wrapper-content" style={{ paddingBottom: 0 }}>
          {subHeader}
        </div>
      )}

      {/* Content */}
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h5 style={{ margin: 0 }}>{sectionTitle ?? `List ${title}`}</h5>
                {extraButton}
              </div>
              <div className="ibox-content">
                {/* Reset */}
                <div style={{ textAlign: 'right', marginBottom: 8 }}>
                  <button className="btn btn-warning btn-sm" onClick={handleReset}>Reset</button>
                </div>

                {/* DataTable controls */}
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
                      style={{ width: 180 }}
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                  </div>
                </div>

                {/* Table */}
                <table className="table table-striped table-bordered table-hover">
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th
                          key={c.header}
                          style={{ width: c.width, textAlign: c.align ?? 'left', cursor: c.sortKey ? 'pointer' : 'default', userSelect: 'none' }}
                          onClick={() => c.sortKey && toggleSort(c.sortKey)}
                        >
                          {c.header}
                          {c.sortKey && (
                            <span style={{ marginLeft: 4, opacity: 0.5 }}>
                              {sortCol === c.sortKey ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                            </span>
                          )}
                        </th>
                      ))}
                      {hasActions && <th style={{ width: 160 }}>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 ? (
                      <tr><td colSpan={columns.length + (hasActions ? 1 : 0)} style={{ textAlign: 'center', padding: 20 }}>No data found.</td></tr>
                    ) : paged.map((row) => (
                      <tr key={rowKey(row)}>
                        {columns.map((c) => (
                          <td key={c.header} style={{ textAlign: c.align ?? 'left', verticalAlign: 'middle' }}>{c.cell(row)}</td>
                        ))}
                        {hasActions && (
                          <td style={{ verticalAlign: 'middle' }}>
                            {onDelete && (
                              <button
                                className="btn btn-danger btn-xs"
                                style={{ marginRight: 4 }}
                                onClick={() => onDelete(row)}
                              >
                                <i className="fa fa-times" style={{ marginRight: 3 }} />Delete
                              </button>
                            )}
                            {onEdit && (
                              <button
                                className="btn btn-white btn-xs"
                                style={{ marginRight: 4 }}
                                onClick={() => onEdit(row)}
                              >
                                <i className="fa fa-pencil" style={{ marginRight: 3 }} />Edit
                              </button>
                            )}
                            {onView && (
                              <button
                                className="btn btn-info btn-xs"
                                onClick={() => onView(row)}
                              >
                                <i className="fa fa-eye" style={{ marginRight: 3 }} />View
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div style={{ fontSize: 13, color: '#676a6c' }}>
                    {sorted.length === 0
                      ? 'No entries'
                      : `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, sorted.length)} of ${sorted.length} entries`}
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

/** Badge for Enable/Disable/Yes/No status */
export function StatusBadge({ value, trueLabel = 'Enable', falseLabel = 'Disable' }: { value: boolean | string | number; trueLabel?: string; falseLabel?: string }) {
  const active = value === true || value === '1' || value === 1 || value === 'Yes' || value === 'Enable';
  return (
    <span className={`label label-${active ? 'primary' : 'danger'}`} style={{ fontSize: 12 }}>
      {active ? trueLabel : falseLabel}
    </span>
  );
}
