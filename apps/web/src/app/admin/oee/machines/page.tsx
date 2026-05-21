'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Machine {
  id: number;
  [k: string]: any;
}

/**
 * /admin/oee/machines — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function MachineAdminPage() {
  return (
    <MasterDataPanel<Machine>
      title="OEE — Machines"
      entityName="Machine"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'OEE'},{'label':'Machines'}]}
      apiPath="/oee/machines"
      blank={{'name':'','lineId':0,'status':'1'}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Machine Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Line ID', width: 100, cell: (r) => r.lineId ?? "—" },
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
        { name: 'name', label: 'Machine Name', required: true },
        { name: 'lineId', label: 'Line ID', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
