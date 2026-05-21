'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Location {
  id: number;
  [k: string]: any;
}

/**
 * /admin/cp/locations — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function LocationAdminPage() {
  return (
    <MasterDataPanel<Location>
      title="Car Pool — Office Locations"
      entityName="Location"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Car Pool'},{'label':'Locations'}]}
      apiPath="/cp/locations"
      blank={{'city':'','area':'','sortOrder':0}}
      searchableKeys={["city","area"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'City', cell: (r) => <span style={{ fontWeight: 600 }}>{r.city}</span> },
        { header: 'Area', cell: (r) => r.area },
        { header: 'Sort', width: 80, cell: (r) => r.sortOrder ?? 0 }
      ]}
      fields={[
        { name: 'city', label: 'City', required: true },
        { name: 'area', label: 'Area', required: true },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' }
      ]}
    />
  );
}
