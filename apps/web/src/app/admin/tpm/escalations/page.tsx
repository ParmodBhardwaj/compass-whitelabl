'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Escalation {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/escalations — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function EscalationAdminPage() {
  return (
    <MasterDataPanel<Escalation>
      title="TPM — Escalation Matrix"
      entityName="Escalation"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'Escalation Matrix'}]}
      apiPath="/tpm-master/escalations"
      blank={{'days':0,'role':'','notifyUserId':0}}
      searchableKeys={["role"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Days', width: 80, cell: (r) => r.days ?? 0 },
        { header: 'Role', cell: (r) => r.role ?? "—" },
        { header: 'Notify User ID', width: 140, cell: (r) => r.notifyUserId ?? r.notify_user_id ?? "—" }
      ]}
      fields={[
        { name: 'days', label: 'Trigger after N days', type: 'number', required: true },
        { name: 'role', label: 'Role to notify' },
        { name: 'notifyUserId', label: 'Notify User ID', type: 'number' }
      ]}
    />
  );
}
