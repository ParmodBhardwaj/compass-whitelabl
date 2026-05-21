import Link from 'next/link';
import { api, CmsPage } from '@/lib/api';
import { notFound } from 'next/navigation';

function resolveImg(src?: string | null, prefix = 'uploads') {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return `/files/${prefix}/${src}`;
}

export default async function CmsPageView({ params }: { params: { alias: string } }) {
  let data: { page: CmsPage; images: any[] };
  try {
    data = await api<any>(`/cms/pages/by-alias/${encodeURIComponent(params.alias)}`);
  } catch {
    return notFound();
  }

  const { page, images } = data;

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{page.title}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>{page.title}</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-lg-10 col-lg-offset-1">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5 style={{ margin: 0 }}>{page.title}</h5>
              </div>
              <div className="ibox-content">
                {page.shortDescription && (
                  <p style={{
                    fontSize: 16, color: '#555', marginBottom: 20, lineHeight: 1.7,
                    borderLeft: '3px solid #e2231a', paddingLeft: 14, fontStyle: 'italic',
                  }}>
                    {page.shortDescription}
                  </p>
                )}

                {page.description ? (
                  <div
                    style={{ fontSize: 14, lineHeight: 1.9, color: '#444' }}
                    dangerouslySetInnerHTML={{ __html: page.description }}
                  />
                ) : (
                  <p className="text-muted">No content available.</p>
                )}

                {/* Attached images */}
                {images.length > 0 && (
                  <>
                    <hr style={{ margin: '24px 0' }} />
                    <h5 style={{ marginBottom: 12, color: '#555' }}>
                      <i className="fa fa-picture-o" style={{ marginRight: 6 }} />Photos
                    </h5>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: 12,
                    }}>
                      {images.map((img: any) => {
                        const src = resolveImg(img.image, 'pages');
                        return src ? (
                          <a key={img.id} href={src} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: 4, overflow: 'hidden', aspectRatio: '4/3', background: '#e7eaec' }}>
                            <img src={src} alt={img.title ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </a>
                        ) : null;
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
