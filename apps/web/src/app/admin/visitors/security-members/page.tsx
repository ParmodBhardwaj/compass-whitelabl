'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Member {
  id: number;
  [k: string]: any;
}

/**
 * /admin/visitors/security-members — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function MemberAdminPage() {
  return (
    <MasterDataPanel<Member>
      title="Visitors — Security Members"
      entityName="Member"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Visitors'},{'label':'Security Members'}]}
      apiPath="/visitors/admin/security-members"
      blank={{ empId: 0, locationId: 0 }}
      searchableKeys={['empId']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Employee Id', cell: (r) => r.empId },
        { header: 'Location Id', cell: (r) => r.locationId },
      ]}
      fields={[
        { name: 'empId',      label: 'Employee Id', type: 'number', required: true },
        { name: 'locationId', label: 'Location Id', type: 'number', required: true },
      ]}
    />
  );
}
