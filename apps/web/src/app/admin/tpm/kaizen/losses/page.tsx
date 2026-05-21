'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Loss {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/kaizen/losses — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function LossAdminPage() {
  return (
    <MasterDataPanel<Loss>
      title="TPM — KaiZen Losses"
      entityName="Loss"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'KaiZen'},{'label':'Losses'}]}
      apiPath="/tpm-master/kaizen-losses"
      blank={{'name':'','lossNumber':'','sortOrder':0,'status':'1'}}
      searchableKeys={["name","lossNumber"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Loss #', width: 100, cell: (r) => r.lossNumber ?? r.loss_number },
        { header: 'Loss Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Sort', width: 70, cell: (r) => r.sortOrder ?? 0 },
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
        { name: 'name', label: 'Loss Name', required: true },
        { name: 'lossNumber', label: 'Loss Number' },
        { name: 'sortOrder', label: 'Sort Order', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
