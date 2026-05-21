'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Initiator {
  id: number;
  [k: string]: any;
}

/**
 * /admin/qa/initiators — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function InitiatorAdminPage() {
  return (
    <MasterDataPanel<Initiator>
      title="Quality Alert — Initiators"
      entityName="Initiator"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Quality Alert'},{'label':'Initiators'}]}
      apiPath="/qa/initiators"
      blank={{'userId':0,'departmentId':0}}
      searchableKeys={["userId"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'User ID', cell: (r) => r.userId },
        { header: 'Department ID', cell: (r) => r.departmentId }
      ]}
      fields={[
        { name: 'userId', label: 'User ID', type: 'number', required: true },
        { name: 'departmentId', label: 'Department ID', type: 'number' }
      ]}
    />
  );
}
