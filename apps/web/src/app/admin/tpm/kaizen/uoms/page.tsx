'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface UoM {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/kaizen/uoms — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function UoMAdminPage() {
  return (
    <MasterDataPanel<UoM>
      title="TPM — KaiZen Unit of Measurement"
      entityName="UoM"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'KaiZen'},{'label':'UoM'}]}
      apiPath="/tpm-master/ks-uoms"
      blank={{'name':''}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Unit', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> }
      ]}
      fields={[
        { name: 'name', label: 'Unit of Measurement', required: true }
      ]}
    />
  );
}
