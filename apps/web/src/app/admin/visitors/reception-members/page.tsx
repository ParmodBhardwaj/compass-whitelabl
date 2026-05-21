'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Member {
  id: number;
  [k: string]: any;
}

/**
 * /admin/visitors/reception-members — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function MemberAdminPage() {
  return (
    <MasterDataPanel<Member>
      title="Visitors — Reception Members"
      entityName="Member"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Visitors'},{'label':'Reception Members'}]}
      apiPath="/visitor-master/reception-members"
      blank={{'userId':0,'locationId':0}}
      searchableKeys={["userId"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'User ID', cell: (r) => r.userId ?? r.user_id },
        { header: 'Location ID', cell: (r) => r.locationId ?? r.location_id }
      ]}
      fields={[
        { name: 'userId', label: 'User ID', type: 'number', required: true },
        { name: 'locationId', label: 'Location ID', type: 'number' }
      ]}
    />
  );
}
