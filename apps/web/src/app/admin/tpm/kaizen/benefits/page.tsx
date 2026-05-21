'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Benefit {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/kaizen/benefits — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function BenefitAdminPage() {
  return (
    <MasterDataPanel<Benefit>
      title="TPM — KaiZen Benefit Types"
      entityName="Benefit"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'KaiZen'},{'label':'Benefit'}]}
      apiPath="/tpm-master/kaizen-losses"
      blank={{'name':'','lossNumber':'BEN','sortOrder':0,'status':'1'}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Benefit', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
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
        { name: 'name', label: 'Benefit Name', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
