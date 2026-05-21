'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Question {
  id: number;
  [k: string]: any;
}

/**
 * /admin/visitors/feedback-questions — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function QuestionAdminPage() {
  return (
    <MasterDataPanel<Question>
      title="Visitors — Feedback Questions"
      entityName="Question"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Visitors'},{'label':'Feedback Questions'}]}
      apiPath="/visitor-master/feedback-questions"
      blank={{'question':'','type':'rating','status':'1'}}
      searchableKeys={["question"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Question', cell: (r) => <span style={{ fontWeight: 600 }}>{r.question}</span> },
        { header: 'Type', width: 100, cell: (r) => r.type },
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
        { name: 'question', label: 'Question', required: true },
        { name: 'type', label: 'Type', placeholder: 'rating | text | choice' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
