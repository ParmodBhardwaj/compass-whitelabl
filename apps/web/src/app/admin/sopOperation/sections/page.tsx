'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface SopSection {
  id: number;
  name?: string;
  type?: 'ss&sc' | 'plant-operation';
  departmentHead?: number;
  sortOrder?: number;
  status?: '0' | '1';
}

/**
 * /admin/sopOperation/sections — SOP Plant-Operation Departments.
 * Same `sop_sections` table, filtered to type='plant-operation'.
 */
export default function SopPlantOpSectionsAdminPage() {
  return (
    <MasterDataPanel<SopSection>
      title="SOP (Plant Operation) — Departments"
      entityName="Section"
      breadcrumb={[
        { label: 'Home', href: '/admin' },
        { label: 'SOP (Plant Operation)' },
        { label: 'Departments' },
      ]}
      apiPath="/sop/sections?type=plant-operation"
      blank={{ name: '', type: 'plant-operation', departmentHead: 0, sortOrder: 0, status: '1' }}
      searchableKeys={['name']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Department Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Head (User ID)', width: 130, cell: (r) => r.departmentHead || '—' },
        { header: 'Sort Order', width: 100, cell: (r) => r.sortOrder ?? 0 },
        {
          header: 'Status', width: 100,
          cell: (r) => (
            <span style={{
              background: r.status === '1' ? '#1ab394' : '#ed5565',
              color: '#fff', borderRadius: 10, padding: '2px 10px',
              fontSize: 11, fontWeight: 700,
            }}>
              {r.status === '1' ? 'Enable' : 'Disable'}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'name',           label: 'Department Name', required: true },
        { name: 'departmentHead', label: 'Department Head (User ID)', type: 'number' },
        { name: 'sortOrder',      label: 'Sort Order', type: 'number' },
        {
          name: 'status', label: 'Status', type: 'select',
          options: [{ value: '1', label: 'Enable' }, { value: '0', label: 'Disable' }],
        },
      ]}
    />
  );
}
