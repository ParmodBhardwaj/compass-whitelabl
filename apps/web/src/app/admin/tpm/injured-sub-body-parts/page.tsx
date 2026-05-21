'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface SubBodyPart {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/injured-sub-body-parts — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function SubBodyPartAdminPage() {
  return (
    <MasterDataPanel<SubBodyPart>
      title="TPM — Injured Sub-Body Parts"
      entityName="Sub-Body Part"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'Injured Sub Body'}]}
      apiPath="/tpm-master/injured-sub-body-parts"
      blank={{'name':'','bodyPartId':0}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Body Part ID', width: 110, cell: (r) => r.bodyPartId ?? r.body_part_id ?? "—" },
        { header: 'Sub-Body Part', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> }
      ]}
      fields={[
        { name: 'bodyPartId', label: 'Parent Body Part ID', type: 'number' },
        { name: 'name', label: 'Sub-Body Part Name', required: true }
      ]}
    />
  );
}
