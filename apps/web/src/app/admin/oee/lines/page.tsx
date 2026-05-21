'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Line {
  id: number;
  [k: string]: any;
}

/**
 * /admin/oee/lines — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function LineAdminPage() {
  return (
    <MasterDataPanel<Line>
      title="OEE — Lines"
      entityName="Line"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'OEE'},{'label':'Lines'}]}
      apiPath="/oee/lines"
      blank={{'name':'','status':'1'}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Line Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
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
        { name: 'name', label: 'Line Name', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
