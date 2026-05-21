'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Instruction {
  id: number;
  [k: string]: any;
}

/**
 * /admin/visitors/instructions — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function InstructionAdminPage() {
  return (
    <MasterDataPanel<Instruction>
      title="Visitors — Instructions"
      entityName="Instruction"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Visitors'},{'label':'Instructions'}]}
      apiPath="/visitor-master/instructions"
      blank={{'title':'','description':'','status':'1'}}
      searchableKeys={["title"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Title', cell: (r) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
        { header: 'Instruction', cell: (r) => <span style={{ fontSize: 12, color: '#666' }}>{(r.description ?? '').slice(0, 100)}</span> },
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
        { name: 'title', label: 'Title', required: true },
        { name: 'description', label: 'Instruction text', type: 'textarea' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
