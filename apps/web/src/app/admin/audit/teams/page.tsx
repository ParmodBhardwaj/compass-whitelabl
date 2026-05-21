'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Team {
  id: number;
  [k: string]: any;
}

/**
 * /admin/audit/teams — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function TeamAdminPage() {
  return (
    <MasterDataPanel<Team>
      title="Audit — Internal Teams"
      entityName="Team"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Audit Tracker'},{'label':'Internal Teams'}]}
      apiPath="/audit-tracker/teams"
      blank={{'name':'','status':'1'}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Team Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Status', width: 100, cell: (r) => (
            <span style={{
              background: r.status === '1' ? '#1ab394' : '#ed5565',
              color: '#fff', borderRadius: 10, padding: '2px 10px',
              fontSize: 11, fontWeight: 700,
            }}>
              {r.status === '1' ? 'Enable' : 'Disable'}
            </span>
          ) }
      ]}
      fields={[
        { name: 'name', label: 'Team Name', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
