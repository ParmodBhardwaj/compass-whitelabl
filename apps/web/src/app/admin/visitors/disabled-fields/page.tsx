'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Field {
  id: number;
  [k: string]: any;
}

/**
 * /admin/visitors/disabled-fields — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function FieldAdminPage() {
  return (
    <MasterDataPanel<Field>
      title="Visitors — Disabled Fields"
      entityName="Field"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Visitors'},{'label':'Disabled Fields'}]}
      apiPath="/visitor-master/disabled-fields"
      blank={{'fieldName':'','locationId':0}}
      searchableKeys={["fieldName"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Field Name', cell: (r) => r.fieldName ?? r.field_name },
        { header: 'Location ID', cell: (r) => r.locationId ?? r.location_id }
      ]}
      fields={[
        { name: 'fieldName', label: 'Field Name', required: true },
        { name: 'locationId', label: 'Location ID', type: 'number' }
      ]}
    />
  );
}
