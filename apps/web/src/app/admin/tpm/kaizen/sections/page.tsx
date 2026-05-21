'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Section {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/kaizen/sections — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function SectionAdminPage() {
  return (
    <MasterDataPanel<Section>
      title="TPM — KaiZen Team Leader Sections"
      entityName="Section"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'KaiZen'},{'label':'Section'}]}
      apiPath="/tpm-master/kaizen-sections"
      blank={{'name':''}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Section', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> }
      ]}
      fields={[
        { name: 'name', label: 'Section Name', required: true }
      ]}
    />
  );
}
