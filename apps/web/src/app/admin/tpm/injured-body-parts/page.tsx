'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface BodyPart {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/injured-body-parts — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function BodyPartAdminPage() {
  return (
    <MasterDataPanel<BodyPart>
      title="TPM — Injured Body Parts"
      entityName="Body Part"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'Injured Body'}]}
      apiPath="/tpm-master/injured-body-parts"
      blank={{'name':''}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Body Part', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> }
      ]}
      fields={[
        { name: 'name', label: 'Body Part Name', required: true }
      ]}
    />
  );
}
