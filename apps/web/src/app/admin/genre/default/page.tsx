'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Category {
  id: number;
  name?: string;
  type?: 'training' | 'finance' | 'mpsheet';
  sortOrder?: number;
  status?: '0' | '1';
}

/**
 * /admin/genre/default — Training Categories.
 * Backed by `hero_category` with type='training'.
 */
export default function TrainingCategoryAdminPage() {
  return (
    <MasterDataPanel<Category>
      title="Training Categories"
      entityName="Category"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Training Categories' }]}
      apiPath="/categories?type=training"
      blank={{ name: '', type: 'training', sortOrder: 0, status: '1' }}
      searchableKeys={['name']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Category Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Sort Order', width: 100, cell: (r) => r.sortOrder ?? 0 },
        {
          header: 'Status', width: 100,
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
        { name: 'name',      label: 'Category Name', required: true },
        { name: 'sortOrder', label: 'Sort Order',    type: 'number' },
        {
          name: 'status',    label: 'Status', type: 'select',
          options: [{ value: '1', label: 'Enable' }, { value: '0', label: 'Disable' }],
        },
      ]}
    />
  );
}
