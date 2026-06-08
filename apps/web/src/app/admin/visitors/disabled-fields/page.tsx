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
      apiPath="/visitors/admin/disabled-fields"
      blank={{ fieldName: '', locationId: 0 }}
      searchableKeys={['fieldName']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Field Name', cell: (r) => <code style={{ fontSize: 12 }}>{r.fieldName}</code> },
        { header: 'Location Id', cell: (r) => r.locationId },
      ]}
      fields={[
        { name: 'fieldName',  label: 'Field Name (DB column / form key)', required: true, placeholder: 'e.g. mealAllowed' },
        { name: 'locationId', label: 'Location Id', type: 'number', required: true },
      ]}
    />
  );
}
