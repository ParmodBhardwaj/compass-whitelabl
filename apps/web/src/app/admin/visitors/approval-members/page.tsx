'use client';
/**
 * /admin/visitors/approval-members — Who can approve visitor passes per
 * location, optionally restricted by pass colour. Backs `visitor_approval_members`.
 */
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Row { id: number; [k: string]: any }

const PASS_OPTIONS = [
  { value: 'all',   label: 'All' },
  { value: 'Red',   label: 'Red' },
  { value: 'Green', label: 'Green' },
  { value: 'Blue',  label: 'Blue' },
];

export default function ApprovalMembersAdminPage() {
  return (
    <MasterDataPanel<Row>
      title="Visitors — Approval Members"
      entityName="Approval Member"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Visitors' }, { label: 'Approval Members' }]}
      apiPath="/visitors/admin/approval-members"
      blank={{ empId: 0, locationId: 0, passTypeApproval: 'all' }}
      searchableKeys={['empId']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Employee Id', cell: (r) => r.empId },
        { header: 'Location Id', cell: (r) => r.locationId },
        {
          header: 'Approves',
          cell: (r) => (
            <span className={`label label-${r.passTypeApproval === 'Red' ? 'danger' : r.passTypeApproval === 'Green' ? 'success' : r.passTypeApproval === 'Blue' ? 'primary' : 'default'}`}>
              {r.passTypeApproval}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'empId',            label: 'Employee Id',     type: 'number', required: true },
        { name: 'locationId',       label: 'Location Id',     type: 'number', required: true },
        { name: 'passTypeApproval', label: 'Pass Type Scope', type: 'select', options: PASS_OPTIONS },
      ]}
    />
  );
}
