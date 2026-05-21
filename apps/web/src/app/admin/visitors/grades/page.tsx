'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Grade {
  id: number;
  [k: string]: any;
}

/**
 * /admin/visitors/grades — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function GradeAdminPage() {
  return (
    <MasterDataPanel<Grade>
      title="Visitors — Grades for Red Pass"
      entityName="Grade"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Visitors'},{'label':'Grades'}]}
      apiPath="/visitor-master/grades"
      blank={{'locationId':0,'grade':''}}
      searchableKeys={["grade"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Location ID', cell: (r) => r.locationId ?? r.location_id },
        { header: 'Grade', cell: (r) => r.grade }
      ]}
      fields={[
        { name: 'locationId', label: 'Location ID', type: 'number', required: true },
        { name: 'grade', label: 'Grade', required: true }
      ]}
    />
  );
}
