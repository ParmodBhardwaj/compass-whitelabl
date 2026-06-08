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
      apiPath="/visitors/admin/reception-members"
      blank={{ name: '', email: '', locationId: 0 }}
      searchableKeys={['name', 'email']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Name', cell: (r) => <strong>{r.name}</strong> },
        { header: 'Email', cell: (r) => <span style={{ color: '#1c84c6' }}>{r.email}</span> },
        { header: 'Location Id', cell: (r) => r.locationId },
      ]}
      fields={[
        { name: 'name',       label: 'Name',         required: true },
        { name: 'email',      label: 'Email',        required: true },
        { name: 'locationId', label: 'Location Id',  type: 'number', required: true },
      ]}
    />
  );
}
