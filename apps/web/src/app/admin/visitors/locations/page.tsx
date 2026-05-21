'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Location {
  id: number;
  [k: string]: any;
}

/**
 * /admin/visitors/locations — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function LocationAdminPage() {
  return (
    <MasterDataPanel<Location>
      title="Visitors — Locations"
      entityName="Location"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Visitors'},{'label':'Locations'}]}
      apiPath="/visitor-master/locations"
      blank={{'name':'','locationCode':'','status':'1'}}
      searchableKeys={["name","locationCode"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Location', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Code', cell: (r) => <code style={{ fontSize: 12 }}>{r.locationCode ?? r.location_code}</code> },
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
        { name: 'name', label: 'Location Name', required: true },
        { name: 'locationCode', label: 'Location Code' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
