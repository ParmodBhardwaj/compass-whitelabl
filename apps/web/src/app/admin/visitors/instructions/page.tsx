'use client';
/**
 * /admin/visitors/instructions — Visitor entry instructions (per location, hindi+english).
 * Backs `visitor_instructions`.
 */
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Row { id: number; [k: string]: any }

export default function InstructionsAdminPage() {
  return (
    <MasterDataPanel<Row>
      title="Visitors — Instructions"
      entityName="Instruction"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Visitors' }, { label: 'Instructions' }]}
      apiPath="/visitors/admin/instructions"
      blank={{ locationId: 0, detail: '', type: 'english', sortOrder: 0 }}
      searchableKeys={['detail']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Loc',  width: 70, cell: (r) => r.locationId },
        { header: 'Lang', width: 90, cell: (r) => <span style={{ textTransform: 'capitalize' }}>{r.type}</span> },
        { header: 'Order', width: 60, cell: (r) => r.sortOrder },
        { header: 'Detail', cell: (r) => <span dangerouslySetInnerHTML={{ __html: (r.detail ?? '').slice(0, 160) }} /> },
      ]}
      fields={[
        { name: 'locationId', label: 'Location Id', type: 'number', required: true },
        { name: 'type',       label: 'Language',    type: 'select', options: [{ value: 'english', label: 'English' }, { value: 'hindi', label: 'Hindi' }] },
        { name: 'sortOrder',  label: 'Sort Order',  type: 'number' },
        { name: 'detail',     label: 'Instruction', type: 'textarea', required: true },
      ]}
    />
  );
}
