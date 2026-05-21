'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Category {
  id: number;
  [k: string]: any;
}

/**
 * /admin/sale-rent/categories — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function CategoryAdminPage() {
  return (
    <MasterDataPanel<Category>
      title="Sale/Rent Categories"
      entityName="Category"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'Sale/Rent'},{'label':'Categories'}]}
      apiPath="/sale/categories"
      blank={{'title':'','sort':0,'status':'1'}}
      searchableKeys={["title"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Title', cell: (r) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
        { header: 'Sort', width: 80, cell: (r) => r.sort ?? 0 },
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
        { name: 'title', label: 'Title', required: true },
        { name: 'sort', label: 'Sort Order', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
