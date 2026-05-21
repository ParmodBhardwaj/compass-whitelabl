import Link from 'next/link';
import { api, NewsItem } from '@/lib/api';
import { notFound } from 'next/navigation';

function resolveImg(src?: string | null, prefix = 'uploads') {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return `/files/${prefix}/${src}`;
}

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function NewsDetail({ params }: { params: { alias: string } }) {
  let item: NewsItem & { description?: string };
  try {
    item = await api<any>(`/news/by-alias/${encodeURIComponent(params.alias)}`);
  } catch {
    return notFound();
  }

  const img = resolveImg(item.image, 'news');

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>News</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/news">News</Link></li>
            <li className="active"><strong>{item.title}</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 20 }}>
          <Link href="/portal/news" className="btn btn-white btn-sm">
            <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back
          </Link>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-lg-10 col-lg-offset-1">
            <div className="ibox float-e-margins">
              {/* Featured image */}
              {img && (
                <div style={{ borderRadius: '4px 4px 0 0', overflow: 'hidden', maxHeight: 400 }}>
                  <img src={img} alt={item.title ?? ''} style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              <div className="ibox-content">
                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  {item.newsDate && (
                    <span style={{ fontSize: 12, color: '#999' }}>
                      <i className="fa fa-calendar" style={{ marginRight: 4 }} />
                      {formatDate(item.newsDate)}
                    </span>
                  )}
                  {item.isFeatured === '1' && (
                    <span className="label label-warning">
                      <i className="fa fa-star" style={{ marginRight: 4 }} />Featured
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, lineHeight: 1.4, color: '#333' }}>
                  {item.title}
                </h2>

                {/* Lead paragraph */}
                {item.shortDescription && (
                  <p style={{
                    fontSize: 16, color: '#555', marginBottom: 20, lineHeight: 1.7,
                    borderLeft: '3px solid #e2231a', paddingLeft: 14,
                    fontStyle: 'italic',
                  }}>
                    {item.shortDescription}
                  </p>
                )}

                {/* Body HTML */}
                {item.description ? (
                  <div
                    className="news-body"
                    style={{ fontSize: 14, lineHeight: 1.9, color: '#444' }}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                ) : (
                  <p className="text-muted">No content available.</p>
                )}

                <hr style={{ margin: '24px 0' }} />
                <Link href="/portal/news" className="btn btn-white btn-sm">
                  <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to News
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
