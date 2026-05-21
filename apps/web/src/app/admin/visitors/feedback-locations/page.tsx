'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Location {
  id: number;
  [k: string]: any;
}

/**
 * /admin/visitors/feedback-locations — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function LocationAdminPage() {
  return (
    <MasterDataPanel<Location>
      title="Visitors — Feedback Locations / Departments"
      entityName="Location"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Visitors'},{'label':'Feedback Location Department'}]}
      apiPath="/visitor-master/feedback-locations"
      blank={{'locationId':0,'departmentId':0}}
      searchableKeys={["locationId"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Location ID', cell: (r) => r.locationId ?? r.location_id },
        { header: 'Department ID', cell: (r) => r.departmentId ?? r.department_id }
      ]}
      fields={[
        { name: 'locationId', label: 'Location ID', type: 'number', required: true },
        { name: 'departmentId', label: 'Department ID', type: 'number' }
      ]}
    />
  );
}
