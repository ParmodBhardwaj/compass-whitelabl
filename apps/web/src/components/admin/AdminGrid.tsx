'use client';
import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  width?: string;
}

export function AdminGrid<T extends { id?: number; userId?: number }>(props: {
  title: string;
  rows: T[];
  columns: Column<T>[];
  onNew?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}) {
  const { title, rows, columns, onNew, onEdit, onDelete } = props;
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        {onNew && (
          <button
            onClick={onNew}
            style={{ background: 'var(--hero-red)', color: 'white', border: 0, borderRadius: 8, padding: '8px 16px', fontWeight: 600 }}
          >
            + New
          </button>
        )}
      </header>
      <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#fafafa', textAlign: 'left' }}>
              {columns.map((c) => (
                <th key={c.header} style={{ padding: 12, fontWeight: 600, color: 'var(--hero-muted)', width: c.width }}>
                  {c.header}
                </th>
              ))}
              {(onEdit || onDelete) && <th style={{ padding: 12, width: 160, textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} style={{ padding: 24, textAlign: 'center', color: 'var(--hero-muted)' }}>
                  No rows yet.
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={(row.id ?? row.userId ?? i) as any} style={{ borderTop: '1px solid #eee' }}>
                {columns.map((c) => (
                  <td key={c.header} style={{ padding: 12 }}>
                    {c.cell(row)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        style={{ background: 'transparent', border: '1px solid var(--hero-border)', borderRadius: 6, padding: '4px 10px', marginRight: 6 }}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        style={{ background: 'transparent', border: '1px solid var(--hero-red)', color: 'var(--hero-red)', borderRadius: 6, padding: '4px 10px' }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
