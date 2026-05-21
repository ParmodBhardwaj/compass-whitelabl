'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Department {
  id: number;
  name?: string;
  plantId?: number;
  sortOrder?: number;
  status?: '0' | '1';
}

/**
 * /admin/department — Department master.
 * Mirrors legacy `lmcadmin/department` (module/ManageAcl/Controller/DepartmentController).
 */
export default function DepartmentAdminPage() {
  return (
    <MasterDataPanel<Department>
      title="Departments"
      entityName="Department"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Departments' }]}
      apiPath="/departments"
      blank={{ name: '', plantId: 0, sortOrder: 0, status: '1' }}
      searchableKeys={['name']}
      columns={[
        { header: 'Id',        width: 60,  cell: (r) => r.id },
        { header: 'Name',      cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Plant ID',  width: 100, cell: (r) => r.plantId ?? '—' },
        { header: 'Sort',      width: 80,  cell: (r) => r.sortOrder ?? 0 },
        {
          header: 'Status', width: 100,
          cell: (r) => (
            <span
              style={{
                background: r.status === '1' ? '#1ab394' : '#ed5565',
                color: '#fff', borderRadius: 10, padding: '2px 10px',
                fontSize: 11, fontWeight: 700,
              }}
            >
              {r.status === '1' ? 'Enable' : 'Disable'}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'name',      label: 'Department Name', required: true },
        { name: 'plantId',   label: 'Plant ID',  type: 'number' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
        {
          name: 'status', label: 'Status', type: 'select',
          options: [{ value: '1', label: 'Enable' }, { value: '0', label: 'Disable' }],
        },
      ]}
    />
  );
}
