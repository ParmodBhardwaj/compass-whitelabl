'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Plant {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/kaizen/plants — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function PlantAdminPage() {
  return (
    <MasterDataPanel<Plant>
      title="TPM — KaiZen Departments"
      entityName="Plant"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'KaiZen'},{'label':'Department'}]}
      apiPath="/tpm-master/kaizen-plants"
      blank={{'name':''}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Department', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> }
      ]}
      fields={[
        { name: 'name', label: 'Department Name', required: true }
      ]}
    />
  );
}
