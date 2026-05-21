'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Holiday {
  id: number;
  [k: string]: any;
}

/**
 * /admin/oee/holidays — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function HolidayAdminPage() {
  return (
    <MasterDataPanel<Holiday>
      title="OEE — Holidays"
      entityName="Holiday"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'OEE'},{'label':'Holidays'}]}
      apiPath="/oee/holidays"
      blank={{'holidayDate':'','name':''}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Date', width: 140, cell: (r) => r.holidayDate },
        { header: 'Holiday Name', cell: (r) => r.name }
      ]}
      fields={[
        { name: 'holidayDate', label: 'Date', required: true, placeholder: 'YYYY-MM-DD' },
        { name: 'name', label: 'Holiday Name', required: true }
      ]}
    />
  );
}
