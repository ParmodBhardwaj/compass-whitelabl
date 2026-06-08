'use client';
/**
 * /admin/visitors/employee-feedback-questions — Employee feedback questions.
 * Backs `visitor_feedback_questions` filtered to `type='employee'`.
 *
 * Companion page to /admin/visitors/feedback-questions (visitor-side).
 */
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Row { id: number; [k: string]: any }

export default function EmployeeFeedbackQuestionsPage() {
  return (
    <MasterDataPanel<Row>
      title="Visitors — Employee Feedback Questions"
      entityName="Question"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Visitors' }, { label: 'Employee Feedback Questions' }]}
      apiPath="/visitors/admin/feedback-questions?type=employee"
      blank={{ questionDescription: '', type: 'employee', questionRating: 5, sortOrder: 0, status: '1' }}
      searchableKeys={['questionDescription']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Question', cell: (r) => <strong>{r.questionDescription}</strong> },
        { header: 'Max Rating', width: 100, cell: (r) => r.questionRating },
        { header: 'Order',      width: 70,  cell: (r) => r.sortOrder },
        {
          header: 'Status', width: 90,
          cell: (r) => (
            <span style={{
              background: r.status === '1' ? '#1ab394' : '#ed5565',
              color: '#fff', borderRadius: 10, padding: '2px 10px',
              fontSize: 11, fontWeight: 700,
            }}>
              {r.status === '1' ? 'Enable' : 'Disable'}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'questionDescription', label: 'Question', type: 'textarea', required: true },
        { name: 'questionRating',      label: 'Max Rating (e.g. 5)', type: 'number' },
        { name: 'sortOrder',           label: 'Sort Order', type: 'number' },
        { name: 'type',                label: 'Type', type: 'select', options: [{ value: 'employee', label: 'Employee' }, { value: 'visitor', label: 'Visitor' }] },
        { name: 'status',              label: 'Status', type: 'select', options: [{ value: '1', label: 'Enable' }, { value: '0', label: 'Disable' }] },
      ]}
    />
  );
}
