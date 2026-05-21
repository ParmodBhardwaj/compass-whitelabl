'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Pillar {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/kaizen/pillars — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function PillarAdminPage() {
  return (
    <MasterDataPanel<Pillar>
      title="TPM — KaiZen Pillars"
      entityName="Pillar"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'KaiZen'},{'label':'Pillar'}]}
      apiPath="/tpm-master/kaizen-pillars"
      blank={{'name':'','plantName':'','sortOrder':0,'pillarHead':0,'pillarHeadEcode':'','status':'1'}}
      searchableKeys={["name","plantName"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Pillar Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Plant', cell: (r) => r.plantName ?? r.plant_name },
        { header: 'Head Ecode', width: 130, cell: (r) => r.pillarHeadEcode ?? r.pillar_head_ecode ?? "—" },
        { header: 'Sort', width: 70, cell: (r) => r.sortOrder ?? 0 },
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
        { name: 'name', label: 'Pillar Name', required: true },
        { name: 'plantName', label: 'Plant Name' },
        { name: 'pillarHead', label: 'Pillar Head (User ID)', type: 'number' },
        { name: 'pillarHeadEcode', label: 'Pillar Head Ecode' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
