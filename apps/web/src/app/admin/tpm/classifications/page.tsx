'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Classification {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/classifications — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function ClassificationAdminPage() {
  return (
    <MasterDataPanel<Classification>
      title="TPM — Classifications"
      entityName="Classification"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'Classifications'}]}
      apiPath="/tpm-master/classifications"
      blank={{'name':'','description':'','status':'1'}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Description', cell: (r) => <span style={{ fontSize: 12, color: '#666' }}>{(r.description ?? '').slice(0, 100)}</span> },
        { header: 'Status', width: 100, cell: (r) => (
            <span style={{
              background: r.status === '1' ? '#1ab394' : '#ed5565',
              color: '#fff', borderRadius: 10, padding: '2px 10px',
              fontSize: 11, fontWeight: 700,
            }}>
              {r.status === '1' ? 'Enable' : 'Disable'}
            </span>
          ) }
      ]}
      fields={[
        { name: 'name', label: 'Classification Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
