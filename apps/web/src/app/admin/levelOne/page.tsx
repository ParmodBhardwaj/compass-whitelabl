'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface SopLevel1 {
  id: number;
  title?: string;
  levelOneFile?: string;
  createdAt?: string;
}

/** /admin/levelOne — SOP Level 1 documents (sop_level1). */
export default function SopLevelOneAdminPage() {
  return (
    <MasterDataPanel<SopLevel1>
      title="SOP — Level One"
      entityName="Level One"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'SOP' }, { label: 'Level One' }]}
      apiPath="/sop/level1"
      blank={{ title: '', levelOneFile: '' }}
      searchableKeys={['title']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Title', cell: (r) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
        { header: 'File', cell: (r) => r.levelOneFile
            ? <a href={r.levelOneFile.startsWith('http') ? r.levelOneFile : `/files/sop/${r.levelOneFile}`} target="_blank" rel="noreferrer" style={{ color: '#1c84c6' }}>
                <i className="fa fa-file-pdf-o" style={{ marginRight: 4 }} />Download
              </a>
            : <span style={{ color: '#bbb' }}>—</span> },
        { header: 'Created', width: 160, cell: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '—' },
      ]}
      fields={[
        { name: 'title',        label: 'Title', required: true },
        { name: 'levelOneFile', label: 'File Path', placeholder: 'level-one-2026.pdf' },
      ]}
    />
  );
}
