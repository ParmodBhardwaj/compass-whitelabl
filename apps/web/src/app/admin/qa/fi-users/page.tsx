'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface CCUser {
  id: number;
  [k: string]: any;
}

/**
 * /admin/qa/fi-users — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function CCUserAdminPage() {
  return (
    <MasterDataPanel<CCUser>
      title="Quality Alert — CC Users"
      entityName="CC User"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Quality Alert'},{'label':'CC Users'}]}
      apiPath="/qa/fi-users"
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
