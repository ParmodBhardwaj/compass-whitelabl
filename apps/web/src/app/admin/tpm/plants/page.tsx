'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Plant {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/plants — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function PlantAdminPage() {
  return (
    <MasterDataPanel<Plant>
      title="TPM — Master Plants"
      entityName="Plant"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'Master Plant'}]}
      apiPath="/tpm-master/plants"
      blank={{'plantName':'','plantCode':'','manufacturerHead':'','plantHead':'','departmentHead':'','plantLocationId':0}}
      searchableKeys={["plantName","plantCode"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Plant Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.plantName ?? r.plant_name}</span> },
        { header: 'Code', cell: (r) => <code style={{ fontSize: 12 }}>{r.plantCode ?? r.plant_code}</code> },
        { header: 'Plant Head', cell: (r) => r.plantHead ?? r.plant_head ?? "—" }
      ]}
      fields={[
        { name: 'plantName', label: 'Plant Name', required: true },
        { name: 'plantCode', label: 'Plant Code', required: true },
        { name: 'manufacturerHead', label: 'Manufacturer Head' },
        { name: 'plantHead', label: 'Plant Head' },
        { name: 'departmentHead', label: 'Department Head' },
        { name: 'plantLocationId', label: 'Plant Location ID', type: 'number' }
      ]}
    />
  );
}
