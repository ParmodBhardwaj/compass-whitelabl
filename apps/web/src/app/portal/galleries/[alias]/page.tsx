import Link from 'next/link';
import { api, GalleryImage } from '@/lib/api';
import { notFound } from 'next/navigation';

function resolveImg(src?: string | null, prefix = 'images') {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return `/files/${prefix}/${src}`;
}

export default async function GalleryDetail({ params }: { params: { alias: string } }) {
  let data: { gallery: any; images: GalleryImage[] };
  try {
    data = await api<any>(`/galleries/by-alias/${encodeURIComponent(params.alias)}`);
  } catch {
    return notFound();
  }

  const { gallery, images } = data;

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{gallery?.title ?? 'Gallery'}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/galleries">Photo Gallery</Link></li>
            <li className="active"><strong>{gallery?.title}</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 20 }}>
          <Link href="/portal/galleries" className="btn btn-white btn-sm">
            <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />All Galleries
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="ibox float-e-margins">
          <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ margin: 0 }}>
              <i className="fa fa-picture-o" style={{ marginRight: 8, color: '#1c84c6' }} />
              {gallery?.title}
            </h5>
            <small className="text-muted">{images.length} {images.length === 1 ? 'photo' : 'photos'}</small>
          </div>
          <div className="ibox-content">
            {images.length === 0 ? (
              <p className="text-center text-muted" style={{ padding: 40 }}>
                <i className="fa fa-picture-o" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
                No photos in this gallery yet.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 12,
              }}>
                {images.map((img) => {
                  const thumb = resolveImg(img.thumbnail ?? img.image, 'images');
                  const full = resolveImg(img.image, 'images');
                  return (
                    <a
                      key={img.id}
                      href={full ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      title={img.title ?? ''}
                      style={{
                        display: 'block',
                        position: 'relative',
                        aspectRatio: '1/1',
                        overflow: 'hidden',
                        borderRadius: 4,
                        background: '#e7eaec',
                      }}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={img.title ?? ''}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className="fa fa-picture-o" style={{ fontSize: 28, color: '#bbb' }} />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="gallery-img-overlay" style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background .2s',
                      }}>
                        <i className="fa fa-search-plus" style={{ fontSize: 24, color: 'rgba(255,255,255,0)', transition: 'color .2s' }} />
                      </div>

                      {/* Featured badge */}
                      {img.isFeatured === '1' && (
                        <span style={{
                          position: 'absolute', top: 6, right: 6,
                          background: '#e2231a', color: '#fff',
                          borderRadius: 3, fontSize: 10, padding: '2px 6px',
                          fontWeight: 600,
                        }}>
                          <i className="fa fa-star" style={{ marginRight: 2 }} />Featured
                        </span>
                      )}

                      {/* Title tooltip on hover */}
                      {img.title && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          background: 'rgba(0,0,0,0.6)', color: '#fff',
                          fontSize: 11, padding: '4px 8px',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          transform: 'translateY(100%)',
                          transition: 'transform .2s',
                        }} className="gallery-img-title">
                          {img.title}
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover effects */}
      <style>{`
        a:hover img { transform: scale(1.08); }
        a:hover .gallery-img-overlay { background: rgba(0,0,0,0.3) !important; }
        a:hover .gallery-img-overlay .fa-search-plus { color: rgba(255,255,255,0.9) !important; }
        a:hover .gallery-img-title { transform: translateY(0) !important; }
      `}</style>
    </>
  );
}
