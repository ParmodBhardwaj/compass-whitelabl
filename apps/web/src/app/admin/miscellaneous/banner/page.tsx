'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';
import { resolveImage } from '@/lib/legacy-url';

interface UpcomingBanner {
  id: number;
  title?: string;
  content?: string;
  image?: string;
  url?: string;
  sortOrder?: number;
  isActive?: '0' | '1';
  store?: number;
}

/** /admin/miscellaneous/banner — Upcoming Banners (hero_banners). */
export default function UpcomingBannerAdminPage() {
  return (
    <MasterDataPanel<UpcomingBanner>
      title="Upcoming Banner"
      entityName="Banner"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Upcoming Banner' }]}
      apiPath="/upcoming-banners"
      blank={{ title: '', content: '', image: '', url: '', sortOrder: 0, isActive: '1', store: 1 }}
      searchableKeys={['title', 'content']}
      columns={[
        { header: 'Id', width: 50, cell: (r) => r.id },
        {
          header: 'Preview', width: 110,
          cell: (r) => r.image
            ? <img
                src={resolveImage(r.image, 'banners') ?? r.image}
                alt=""
                style={{ width: 90, height: 42, objectFit: 'cover', borderRadius: 3, border: '1px solid #eee' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            : <span style={{ color: '#bbb' }}>—</span>,
        },
        { header: 'Title', cell: (r) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
        { header: 'Content', cell: (r) => <span style={{ fontSize: 12, color: '#666' }}>{r.content}</span> },
        { header: 'Sort', width: 60, cell: (r) => r.sortOrder ?? 0 },
        { header: 'Store', width: 60, cell: (r) => r.store ?? 1 },
        {
          header: 'Status', width: 80,
          cell: (r) => (
            <span style={{
              background: r.isActive === '1' ? '#1ab394' : '#ed5565',
              color: '#fff', borderRadius: 10, padding: '2px 10px',
              fontSize: 11, fontWeight: 700,
            }}>
              {r.isActive === '1' ? 'Active' : 'Inactive'}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'title',     label: 'Title',         required: true },
        { name: 'content',   label: 'Content',       type: 'textarea' },
        { name: 'image',     label: 'Image filename' },
        { name: 'url',       label: 'Target URL' },
        { name: 'sortOrder', label: 'Sort Order',    type: 'number' },
        { name: 'store',     label: 'Store ID',      type: 'number' },
        {
          name: 'isActive', label: 'Status', type: 'select',
          options: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }],
        },
      ]}
    />
  );
}
