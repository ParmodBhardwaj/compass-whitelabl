import Link from 'next/link';
import { api } from '@/lib/api';

interface Activity {
  id: number;
  title?: string;
  alias?: string;
  shortDescription?: string;
  activityDate?: string;
  image?: string;
  isFeatured?: '0' | '1';
  status?: '0' | '1';
}

export default async function ActivitiesListPage() {
  let items: Activity[] = [];
  try {
    items = await api<Activity[]>('/activities?status=1&limit=50');
  } catch {}

  return (
    <>
      {/* Page Heading */}
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Activities</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>Activities</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        {items.length === 0 ? (
          <div className="ibox">
            <div className="ibox-content">
              <p className="text-center text-muted" style={{ padding: 40 }}>No activities found.</p>
            </div>
          </div>
        ) : (
          <div className="row">
            {items.map(item => (
              <div key={item.id} className="col-lg-4 col-md-6">
                <div className="ibox float-e-margins">
                  {item.image && (
                    <div style={{ overflow: 'hidden', maxHeight: 180 }}>
                      <img
                        src={item.image}
                        alt={item.title ?? ''}
                        style={{ width: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )}
                  <div className="ibox-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#999' }}>{item.activityDate}</span>
                      {item.isFeatured === '1' && (
                        <span className="label label-warning">Featured</span>
                      )}
                    </div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>
                      <Link href={`/portal/activities/${item.alias ?? item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.title}
                      </Link>
                    </h4>
                    {item.shortDescription && (
                      <p style={{ fontSize: 13, color: '#676a6c', margin: '0 0 12px', lineHeight: 1.5 }}>
                        {item.shortDescription}
                      </p>
                    )}
                    <Link
                      href={`/portal/activities/${item.alias ?? item.id}`}
                      className="btn btn-xs btn-primary"
                    >
                      Read more <i className="fa fa-arrow-right" style={{ marginLeft: 4 }} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
