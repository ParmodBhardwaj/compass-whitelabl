'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Location {
  id: number;
  [k: string]: any;
}

/**
 * /admin/visitors/feedback-locations — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function LocationAdminPage() {
  return (
    <MasterDataPanel<Location>
      title="Visitors — Feedback Locations / Departments"
      entityName="Location"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Visitors'},{'label':'Feedback Location Department'}]}
      apiPath="/visitors/admin/feedback-location-dept"
      blank={{ locationId: 0, departmentId: 0, status: '1' }}
      searchableKeys={['locationId']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Location Id', cell: (r) => r.locationId },
        { header: 'Department Id', cell: (r) => r.departmentId },
        {
          header: 'Status', width: 90,
          cell: (r) => (
            <span style={{
              background: r.status === '1' ? '#1ab394' : '#ed5565',
              color: '#fff', borderRadius: 10, padding: '2px 10px',
              fontSize: 11, fontWeight: 700,
            }}>
              {r.status === '1' ? 'Active' : 'Inactive'}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'locationId',   label: 'Location Id',   type: 'number', required: true },
        { name: 'departmentId', label: 'Department Id', type: 'number', required: true },
        { name: 'status',       label: 'Status',        type: 'select', options: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }] },
      ]}
    />
  );
}
