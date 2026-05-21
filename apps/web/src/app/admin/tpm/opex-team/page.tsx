'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Member {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/opex-team — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function MemberAdminPage() {
  return (
    <MasterDataPanel<Member>
      title="TPM — Opex Team Members"
      entityName="Member"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'Opex Team'}]}
      apiPath="/tpm-master/opex-team"
      blank={{'userId':0}}
      searchableKeys={["userId"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'User ID', cell: (r) => r.userId ?? r.user_id }
      ]}
      fields={[
        { name: 'userId', label: 'User ID', type: 'number', required: true }
      ]}
    />
  );
}
