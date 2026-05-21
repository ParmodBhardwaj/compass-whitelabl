'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Member {
  id: number;
  [k: string]: any;
}

/**
 * /admin/oee/business-excellence — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function MemberAdminPage() {
  return (
    <MasterDataPanel<Member>
      title="OEE — Business Excellence"
      entityName="Member"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'OEE'},{'label':'Business Excellence'}]}
      apiPath="/oee-extras/business-excellence"
      blank={{'userId':0}}
      searchableKeys={["userId"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'User ID', cell: (r) => r.userId }
      ]}
      fields={[
        { name: 'userId', label: 'User ID', type: 'number', required: true }
      ]}
    />
  );
}
