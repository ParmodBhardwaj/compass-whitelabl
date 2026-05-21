'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Type {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/equipment-types — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function TypeAdminPage() {
  return (
    <MasterDataPanel<Type>
      title="TPM — Tag/Equipment Types"
      entityName="Type"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'Tag Type'}]}
      apiPath="/tpm-master/ks-equipment-types"
      blank={{'name':''}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Equipment Type', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> }
      ]}
      fields={[
        { name: 'name', label: 'Type Name', required: true }
      ]}
    />
  );
}
