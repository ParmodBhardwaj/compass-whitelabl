import Link from 'next/link';
import { api, NewsItem } from '@/lib/api';

/** Resolve a legacy image path that might be a bare filename. */
function resolveImg(src?: string | null, prefix = 'uploads') {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return `/files/${prefix}/${src}`;
}

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function NewsListPage() {
  let items: NewsItem[] = [];
  try {
    items = await api<NewsItem[]>('/news?store=1&limit=50');
  } catch {}

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>News</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>News</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {items.length === 0 ? (
          <div className="ibox">
            <div className="ibox-content">
              <p className="text-center text-muted" style={{ padding: 40 }}>No news articles found.</p>
            </div>
          </div>
        ) : (
          <div className="row">
            {items.map(item => {
              const img = resolveImg(item.image, 'news');
              return (
                <div key={item.id} className="col-lg-4 col-md-6">
                  <div className="ibox float-e-margins">
                    {img && (
                      <Link href={item.alias ? `/portal/news/${item.alias}` : '/portal/news'}>
                        <div style={{ overflow: 'hidden', maxHeight: 180 }}>
                          <img
                            src={img}
                            alt={item.title ?? ''}
                            style={{ width: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                          />
                        </div>
                      </Link>
                    )}
                    <div className="ibox-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        {item.newsDate && (
                          <span style={{ fontSize: 11, color: '#999' }}>
                            <i className="fa fa-calendar" style={{ marginRight: 4 }} />
                            {formatDate(item.newsDate)}
                          </span>
                        )}
                        {item.isFeatured === '1' && (
                          <span className="label label-warning">Featured</span>
                        )}
                      </div>
                      <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>
                        <Link
                          href={item.alias ? `/portal/news/${item.alias}` : '/portal/news'}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {item.title}
                        </Link>
                      </h4>
                      {item.shortDescription && (
                        <p style={{ fontSize: 13, color: '#676a6c', margin: '0 0 12px', lineHeight: 1.5 }}>
                          {item.shortDescription}
                        </p>
                      )}
                      <Link
                        href={item.alias ? `/portal/news/${item.alias}` : '/portal/news'}
                        className="btn btn-xs btn-primary"
                      >
                        Read more <i className="fa fa-arrow-right" style={{ marginLeft: 4 }} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
