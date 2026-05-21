'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface PassType {
  id: number;
  [k: string]: any;
}

/**
 * /admin/visitors/pass-types — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function PassTypeAdminPage() {
  return (
    <MasterDataPanel<PassType>
      title="Visitors — Pass Types"
      entityName="Pass Type"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Visitors'},{'label':'Pass Types'}]}
      apiPath="/visitor-master/passes"
      blank={{'name':'','locationCode':'','passDay':'single','requiredApproval':'yes','maxDaysAllowed':1}}
      searchableKeys={["name","locationCode"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Pass Type', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Code', cell: (r) => <code style={{ fontSize: 12 }}>{r.locationCode ?? r.location_code}</code> },
        { header: 'Days', width: 100, cell: (r) => r.passDay ?? r.pass_day },
        { header: 'Max Days', width: 100, cell: (r) => r.maxDaysAllowed ?? r.max_days_allowed },
        { header: 'Approval', width: 100, cell: (r) => r.requiredApproval ?? r.required_approval }
      ]}
      fields={[
        { name: 'name', label: 'Pass Type Name', required: true },
        { name: 'locationCode', label: 'Location Code' },
        { name: 'passDay', label: 'Pass Duration', type: 'select', options: [{'value':'single','label':'Single Day'},{'value':'mutiple','label':'Multiple Days'}] },
        { name: 'requiredApproval', label: 'Approval Required', type: 'select', options: [{'value':'yes','label':'Yes'},{'value':'no','label':'No'}] },
        { name: 'maxDaysAllowed', label: 'Max Days Allowed', type: 'number' }
      ]}
    />
  );
}
