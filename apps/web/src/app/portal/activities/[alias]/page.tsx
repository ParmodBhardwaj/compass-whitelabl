import Link from 'next/link';
import { api } from '@/lib/api';
import { notFound } from 'next/navigation';

interface Activity {
  id: number;
  title?: string;
  alias?: string;
  shortDescription?: string;
  description?: string;
  activityDate?: string;
  image?: string;
  isFeatured?: '0' | '1';
}

export default async function ActivityDetail({ params }: { params: { alias: string } }) {
  let item: Activity;
  try {
    item = await api<Activity>(`/activities/by-alias/${encodeURIComponent(params.alias)}`);
  } catch {
    return notFound();
  }

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>{item.title}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/activities">Activities</Link></li>
            <li className="active"><strong>{item.title}</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-lg-8 col-lg-offset-2">
            <div className="ibox float-e-margins">
              <div className="ibox-content">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title ?? ''}
                    style={{ width: '100%', borderRadius: 4, marginBottom: 20, maxHeight: 400, objectFit: 'cover' }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {item.activityDate && (
                    <span style={{ fontSize: 13, color: '#999' }}>
                      <i className="fa fa-calendar" style={{ marginRight: 4 }} />
                      {item.activityDate}
                    </span>
                  )}
                  {item.isFeatured === '1' && (
                    <span className="label label-warning">Featured</span>
                  )}
                </div>

                {item.shortDescription && (
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
                    {item.shortDescription}
                  </p>
                )}

                {item.description && (
                  <div
                    className="text-content"
                    style={{ fontSize: 14, lineHeight: 1.8, color: '#333' }}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                )}

                <hr />
                <Link href="/portal/activities" className="btn btn-white btn-sm">
                  <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to Activities
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
