'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Cutoff {
  id: number;
  [k: string]: any;
}

/**
 * /admin/audit/cutoff-dates — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function CutoffAdminPage() {
  return (
    <MasterDataPanel<Cutoff>
      title="Audit — Cutoff Dates"
      entityName="Cutoff"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Audit Tracker'},{'label':'Cutoff Dates'}]}
      apiPath="/audit-tracker/cutoff-dates"
      blank={{'cutoffDate':'','description':''}}
      searchableKeys={["description"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Cutoff Date', width: 140, cell: (r) => r.cutoffDate },
        { header: 'Description', cell: (r) => r.description }
      ]}
      fields={[
        { name: 'cutoffDate', label: 'Cutoff Date', required: true, placeholder: 'YYYY-MM-DD' },
        { name: 'description', label: 'Description', type: 'textarea' }
      ]}
    />
  );
}
