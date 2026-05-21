'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';
import { resolveImage } from '@/lib/legacy-url';

interface LandingImage { id: number; image?: string; url?: string }

/** /admin/landingImage — Landing Page Images (home_banners). */
export default function LandingImageAdminPage() {
  return (
    <MasterDataPanel<LandingImage>
      title="Landing Page Images"
      entityName="Image"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Landing Page Images' }]}
      apiPath="/landing-images"
      blank={{ image: '', url: '' }}
      searchableKeys={['url', 'image']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        {
          header: 'Preview', width: 140,
          cell: (r) => r.image
            ? <img
                src={resolveImage(r.image, 'banners') ?? r.image}
                alt=""
                style={{ width: 110, height: 50, objectFit: 'cover', borderRadius: 3, border: '1px solid #eee' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            : <span style={{ color: '#bbb' }}>—</span>,
        },
        { header: 'Image', cell: (r) => <code style={{ fontSize: 12, color: '#555' }}>{r.image}</code> },
        { header: 'Target URL', cell: (r) => r.url
            ? <a href={r.url} target="_blank" rel="noreferrer" style={{ color: '#1c84c6' }}>{r.url}</a>
            : <span style={{ color: '#bbb' }}>—</span> },
      ]}
      fields={[
        { name: 'image', label: 'Image filename', required: true, placeholder: 'banner-2026-05.jpg' },
        { name: 'url',   label: 'Click-through URL', placeholder: '/portal/news or external URL' },
      ]}
    />
  );
}
