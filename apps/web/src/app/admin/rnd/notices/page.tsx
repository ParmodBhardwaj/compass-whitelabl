'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Notice {
  id: number;
  [k: string]: any;
}

/**
 * /admin/rnd/notices — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function NoticeAdminPage() {
  return (
    <MasterDataPanel<Notice>
      title="R&D Notice Board"
      entityName="Notice"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'R&D'},{'label':'Notice Board'}]}
      apiPath="/rnd/notices"
      blank={{'description':'','status':'1'}}
      searchableKeys={["description"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Notice', cell: (r) => <span style={{ fontSize: 12, color: '#666' }}>{(r.description ?? '').slice(0, 100)}</span> },
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
        { name: 'description', label: 'Notice text', type: 'textarea', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
