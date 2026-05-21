'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Type {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/hazard-types — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function TypeAdminPage() {
  return (
    <MasterDataPanel<Type>
      title="TPM — Hazard Types"
      entityName="Type"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'Hazard Type'}]}
      apiPath="/tpm-master/hazard-types"
      blank={{'name':''}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> }
      ]}
      fields={[
        { name: 'name', label: 'Hazard Type Name', required: true }
      ]}
    />
  );
}
