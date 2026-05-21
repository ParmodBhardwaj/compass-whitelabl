'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Event {
  id: number;
  [k: string]: any;
}

/**
 * /admin/dni/events — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function EventAdminPage() {
  return (
    <MasterDataPanel<Event>
      title="D&I — Events"
      entityName="Event"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'D&I'},{'label':'Events'}]}
      apiPath="/dni/events"
      blank={{'title':'','shortDescription':'','description':'','image':'','sortOrder':0,'status':'1','isFeatured':'0'}}
      searchableKeys={["title","shortDescription"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Title', cell: (r) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
        { header: 'Short Description', cell: (r) => <span style={{ fontSize: 12, color: '#666' }}>{(r.shortDescription ?? '').slice(0, 100)}</span> },
        { header: 'Sort', width: 80, cell: (r) => r.sortOrder ?? 0 },
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
        { name: 'shortDescription', label: 'Short Description' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'image', label: 'Image filename' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
