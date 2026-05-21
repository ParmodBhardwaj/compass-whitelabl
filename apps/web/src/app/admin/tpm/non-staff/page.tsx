'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Employee {
  id: number;
  [k: string]: any;
}

/**
 * /admin/tpm/non-staff — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function EmployeeAdminPage() {
  return (
    <MasterDataPanel<Employee>
      title="TPM — Non-Staff Master"
      entityName="Employee"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'TPM'},{'label':'Non Staff'}]}
      apiPath="/tpm-master/non-staff"
      blank={{'employeeName':'','ecNo':'','departmentName':'','sectionName':'','employeeType':'','designation':''}}
      searchableKeys={["employeeName","ecNo","departmentName"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'EC No', width: 90, cell: (r) => r.ecNo ?? r.ec_no },
        { header: 'Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.employeeName ?? r.employee_name}</span> },
        { header: 'Department', cell: (r) => r.departmentName ?? r.department_name },
        { header: 'Section', cell: (r) => r.sectionName ?? r.section_name },
        { header: 'Designation', cell: (r) => r.designation }
      ]}
      fields={[
        { name: 'employeeName', label: 'Employee Name', required: true },
        { name: 'ecNo', label: 'EC Number', required: true },
        { name: 'departmentName', label: 'Department' },
        { name: 'sectionName', label: 'Section' },
        { name: 'designation', label: 'Designation' },
        { name: 'employeeType', label: 'Employee Type' }
      ]}
    />
  );
}
