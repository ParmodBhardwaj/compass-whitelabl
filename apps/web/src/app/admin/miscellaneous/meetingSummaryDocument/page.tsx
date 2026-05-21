'use client';
import { useEffect, useState } from 'react';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';
import { apiFetch } from '@/lib/auth';

interface MeetingDoc {
  id: number;
  docType?: 'doc' | 'summary';
  title?: string;
  uploadedDate?: string;
  uploadedFile?: string;
  tags?: string;
  uploadedBy?: number;
  sortOrder?: number;
  status?: '0' | '1';
}

/**
 * /admin/miscellaneous/meetingSummaryDocument — Action Items and MoMs.
 * Maps to `meeting_document` rows where doc_type='summary'.
 */
export default function MeetingSummaryAdminPage() {
  const [uid, setUid] = useState(1);
  useEffect(() => {
    apiFetch<{ id: number }>('/auth/me').then(me => setUid(me?.id ?? 1)).catch(() => {});
  }, []);

  return (
    <MasterDataPanel<MeetingDoc>
      title="Action Items and MoMs"
      entityName="MoM"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Action Items and MoMs' }]}
      apiPath="/meeting-documents?docType=summary"
      blank={{
        docType: 'summary', title: '', uploadedDate: new Date().toISOString().slice(0, 10),
        uploadedFile: '', tags: '', uploadedBy: uid, sortOrder: 0, status: '1',
      }}
      searchableKeys={['title', 'tags']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Title', cell: (r) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
        { header: 'Meeting Date', width: 130, cell: (r) => r.uploadedDate ?? '—' },
        { header: 'File', cell: (r) => r.uploadedFile
            ? <a href={r.uploadedFile.startsWith('http') ? r.uploadedFile : `/files/meeting-documents/${r.uploadedFile}`} target="_blank" rel="noreferrer" style={{ color: '#1c84c6' }}>
                <i className="fa fa-file-pdf-o" style={{ marginRight: 4 }} />Download
              </a>
            : <span style={{ color: '#bbb' }}>—</span> },
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
        { name: 'title',        label: 'Title',         required: true },
        { name: 'uploadedDate', label: 'Meeting Date' },
        { name: 'uploadedFile', label: 'File Path',     placeholder: 'mom-2026-05.pdf' },
        { name: 'tags',         label: 'Tags',          placeholder: 'comma,separated' },
        { name: 'sortOrder',    label: 'Sort Order',    type: 'number' },
        {
          name: 'status', label: 'Status', type: 'select',
          options: [{ value: '1', label: 'Enable' }, { value: '0', label: 'Disable' }],
        },
      ]}
    />
  );
}
