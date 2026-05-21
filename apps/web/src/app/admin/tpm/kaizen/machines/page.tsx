'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Machine {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/kaizen/machines — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function MachineAdminPage() {
  return (
    <MasterDataPanel<Machine>
      title="TPM — KaiZen Machines"
      entityName="Machine"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'KaiZen'},{'label':'Machine'}]}
      apiPath="/tpm-master/kaizen-machines"
      blank={{'name':'','status':'1'}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Machine', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
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
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
