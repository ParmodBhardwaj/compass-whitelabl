'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Officer {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/hr-officers — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function OfficerAdminPage() {
  return (
    <MasterDataPanel<Officer>
      title="TPM — HR Officers"
      entityName="Officer"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'HR Officers'}]}
      apiPath="/tpm-master/officers?type=hr"
      blank={{'userId':0,'type':'hr','plantId':0}}
      searchableKeys={["userId"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'User ID', cell: (r) => r.userId },
        { header: 'Plant ID', cell: (r) => r.plantId }
      ]}
      fields={[
        { name: 'userId', label: 'User ID', type: 'number', required: true },
        { name: 'plantId', label: 'Plant ID', type: 'number', required: true },
        { name: 'type', label: 'Officer Type', type: 'select', required: true, options: [{'value':'hr','label':'HR'}] }
      ]}
    />
  );
}
