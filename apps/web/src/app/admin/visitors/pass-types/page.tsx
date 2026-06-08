'use client';
/**
 * /admin/visitors/pass-types — Pass type catalog (Red/Green/Blue/etc).
 * Backs `visitor_pass`.
 */
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Row { id: number; [k: string]: any }

const ZERO_ONE = [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }];

export default function PassTypesAdminPage() {
  return (
    <MasterDataPanel<Row>
      title="Visitors — Pass Types"
      entityName="Pass Type"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Visitors' }, { label: 'Pass Types' }]}
      apiPath="/visitors/admin/passes"
      blank={{ name: '', locationId: 0, redPassApproval: '0', status: '1' }}
      searchableKeys={['name']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Pass Type', cell: (r) => <strong>{r.name}</strong> },
        { header: 'Loc', width: 70, cell: (r) => r.locationId },
        { header: 'Red-Pass Approval', width: 140, cell: (r) => r.redPassApproval === '1' ? 'Yes' : 'No' },
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
        { name: 'name',            label: 'Pass Name',          required: true },
        { name: 'locationId',      label: 'Location Id',        type: 'number', required: true },
        { name: 'redPassApproval', label: 'Needs Red Approval', type: 'select', options: ZERO_ONE },
        { name: 'status',          label: 'Status',             type: 'select', options: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }] },
      ]}
    />
  );
}
