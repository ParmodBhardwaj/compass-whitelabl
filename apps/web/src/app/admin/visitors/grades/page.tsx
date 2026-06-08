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
      apiPath="/visitors/admin/grades"
      blank={{ locationId: 0, grades: '', passType: 'Red' }}
      searchableKeys={['grades']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Location Id', width: 100, cell: (r) => r.locationId },
        { header: 'Pass Type', width: 110, cell: (r) => <span className={`label label-${r.passType === 'Red' ? 'danger' : r.passType === 'Green' ? 'success' : r.passType === 'Blue' ? 'primary' : 'default'}`}>{r.passType}</span> },
        { header: 'Grades (comma-separated)', cell: (r) => <code style={{ fontSize: 12 }}>{r.grades}</code> },
      ]}
      fields={[
        { name: 'locationId', label: 'Location Id', type: 'number', required: true },
        { name: 'passType',   label: 'Pass Type',   type: 'select', options: [{ value: 'Red', label: 'Red' }, { value: 'Green', label: 'Green' }, { value: 'Blue', label: 'Blue' }] },
        { name: 'grades',     label: 'Grades (comma-separated, e.g. M1,M2,M3)', required: true },
      ]}
    />
  );
}
