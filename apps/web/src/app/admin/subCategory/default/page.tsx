'use client';
import { useEffect, useState } from 'react';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';
import { apiFetch } from '@/lib/auth';

interface SubCategory {
  id: number;
  categoryId?: number;
  name?: string;
  extraField?: string;
  type?: 'training';
  sortOrder?: number;
  status?: '0' | '1';
}
interface Category { id: number; name?: string }

/**
 * /admin/subCategory/default — Training Sub-Categories.
 * Backed by `hero_sub_category`. The Category dropdown is loaded from
 * /categories?type=training so admins can map sub-cat → cat in one place.
 */
export default function TrainingSubCategoryAdminPage() {
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => {
    apiFetch<Category[]>('/categories?type=training')
      .then(d => setCats(Array.isArray(d) ? d : []))
      .catch(() => setCats([]));
  }, []);

  return (
    <MasterDataPanel<SubCategory>
      title="Training Sub-Categories"
      entityName="Sub-Category"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Training Sub-Categories' }]}
      apiPath="/sub-categories?type=training"
      blank={{ categoryId: 0, name: '', extraField: '', type: 'training', sortOrder: 0, status: '1' }}
      searchableKeys={['name']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        {
          header: 'Category', width: 200,
          cell: (r) => cats.find(c => c.id === r.categoryId)?.name ?? `#${r.categoryId ?? 0}`,
        },
        { header: 'Sub-Category Name', cell: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: 'Extra', cell: (r) => r.extraField ?? '' },
        { header: 'Sort', width: 80, cell: (r) => r.sortOrder ?? 0 },
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
        {
          name: 'categoryId', label: 'Category', type: 'select', required: true,
          options: cats.map(c => ({ value: c.id, label: c.name ?? `#${c.id}` })),
        },
        { name: 'name',       label: 'Sub-Category Name', required: true },
        { name: 'extraField', label: 'Extra Info', placeholder: 'optional' },
        { name: 'sortOrder',  label: 'Sort Order', type: 'number' },
        {
          name: 'status', label: 'Status', type: 'select',
          options: [{ value: '1', label: 'Enable' }, { value: '0', label: 'Disable' }],
        },
      ]}
    />
  );
}
