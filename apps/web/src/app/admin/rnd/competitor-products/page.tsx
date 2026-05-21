'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Product {
  id: number;
  [k: string]: any;
}

/**
 * /admin/rnd/competitor-products — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function ProductAdminPage() {
  return (
    <MasterDataPanel<Product>
      title="R&D — Competitor Products"
      entityName="Product"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'R&D'},{'label':'Product Launch'}]}
      apiPath="/rnd/competitor-products"
      blank={{'name':'','price':0,'description':'','image':'','status':'1'}}
      searchableKeys={["name"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Price', width: 100, cell: (r) => <span style={{ color: '#e2231a', fontWeight: 700 }}>₹{r.price}</span> },
        { header: 'Description', cell: (r) => <span style={{ fontSize: 12, color: '#666' }}>{(r.description ?? '').slice(0, 100)}</span> },
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
        { name: 'name', label: 'Product Name', required: true },
        { name: 'price', label: 'Price (INR)', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'image', label: 'Product Image', type: 'image', imageFolder: 'rnd' },
        { name: 'status', label: 'Status', type: 'select', options: [{'value':'1','label':'Enable'},{'value':'0','label':'Disable'}] }
      ]}
    />
  );
}
