'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Coordinator {
  id: number;
  [k: string]: any;
}

/**
 * /admin/oee/mfg-coordinators — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function CoordinatorAdminPage() {
  return (
    <MasterDataPanel<Coordinator>
      title="OEE — Mfg Coordinators"
      entityName="Coordinator"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'OEE'},{'label':'Mfg Coordinators'}]}
      apiPath="/oee-extras/mfg-coordinators"
      blank={{'userId':0}}
      searchableKeys={["userId"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'User ID', cell: (r) => r.userId }
      ]}
      fields={[
        { name: 'userId', label: 'User ID', type: 'number', required: true }
      ]}
    />
  );
}
