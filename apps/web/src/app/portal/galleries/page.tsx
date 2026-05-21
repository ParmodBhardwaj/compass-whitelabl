import Link from 'next/link';
import { api, Gallery } from '@/lib/api';

function resolveImg(src?: string | null, prefix = 'images') {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return `/files/${prefix}/${src}`;
}

export default async function GalleriesIndex() {
  let galleries: Gallery[] = [];
  try {
    galleries = await api<Gallery[]>('/galleries?store=1&covers=1');
  } catch {}

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Photo Gallery</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Photo Gallery</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {galleries.length === 0 ? (
          <div className="ibox">
            <div className="ibox-content">
              <p className="text-center text-muted" style={{ padding: 40 }}>No galleries found.</p>
            </div>
          </div>
        ) : (
          <div className="row">
            {galleries.map((g) => {
              const cover = resolveImg(g.coverImage, 'images');
              return (
                <div key={g.id} className="col-lg-3 col-md-4 col-sm-6">
                  <div className="ibox float-e-margins" style={{ marginBottom: 16 }}>
                    <Link
                      href={g.alias ? `/portal/galleries/${g.alias}` : '#'}
                      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                    >
                      {/* Thumbnail */}
                      <div style={{
                        position: 'relative',
                        overflow: 'hidden',
                        aspectRatio: '4/3',
                        background: '#e7eaec',
                        borderRadius: '4px 4px 0 0',
                      }}>
                        {cover ? (
                          <img
                            src={cover}
                            alt={g.title ?? ''}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <i className="fa fa-picture-o" style={{ fontSize: 40, color: '#bbb' }} />
                          </div>
                        )}
                        {/* Overlay */}
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(0,0,0,0)',
                          transition: 'background .2s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className="fa fa-search-plus" style={{ fontSize: 28, color: 'rgba(255,255,255,0)', transition: 'color .2s' }} />
                        </div>
                      </div>

                      <div className="ibox-content" style={{ padding: '10px 14px' }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.title}
                        </p>
                        {typeof g.imageCount === 'number' && (
                          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#999' }}>
                            <i className="fa fa-photo" style={{ marginRight: 4 }} />
                            {g.imageCount} {g.imageCount === 1 ? 'photo' : 'photos'}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover effect */}
      <style>{`
        .ibox:hover img { transform: scale(1.05); }
        .ibox:hover .fa-search-plus { color: rgba(255,255,255,0.9) !important; }
        .ibox:hover [style*="rgba(0,0,0,0)"] { background: rgba(0,0,0,0.25) !important; }
      `}</style>
    </>
  );
}
