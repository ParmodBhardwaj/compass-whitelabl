'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Joiner {
  id: number;
  [k: string]: any;
}

/**
 * /admin/rnd/joinees — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function JoinerAdminPage() {
  return (
    <MasterDataPanel<Joiner>
      title="R&D — New Joiners"
      entityName="Joiner"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'R&D'},{'label':'New Joiners'}]}
      apiPath="/rnd/joinees"
      blank={{'name':'','designation':'','description':'','image':'','status':'1','storeId':6,'type':''}}
      searchableKeys={["name","designation"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Designation', cell: (r) => r.designation },
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
        { name: 'name', label: 'Name', required: true },
        { name: 'designation', label: 'Designation' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'image', label: 'Photo', type: 'image', imageFolder: 'rnd' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
