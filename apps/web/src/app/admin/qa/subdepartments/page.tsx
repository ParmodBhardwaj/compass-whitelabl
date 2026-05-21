'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface SubDepartment {
  id: number;
  [k: string]: any;
}

/**
 * /admin/qa/subdepartments — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function SubDepartmentAdminPage() {
  return (
    <MasterDataPanel<SubDepartment>
      title="Quality Alert — Sub Departments"
      entityName="Sub Department"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Quality Alert'},{'label':'Sub Departments'}]}
      apiPath="/qa/subdepartments"
      blank={{'name':'','departmentId':0,'status':'1'}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Dept ID', width: 100, cell: (r) => r.departmentId ?? 0 },
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
        { name: 'name', label: 'Name', required: true },
        { name: 'departmentId', label: 'Department ID', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
