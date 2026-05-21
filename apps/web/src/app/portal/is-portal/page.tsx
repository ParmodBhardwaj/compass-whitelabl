'use client';
/**
 * /portal/is-portal — IS (Information Security) Portal landing.
 * Mirrors legacy /is-portal.html.
 */
import Link from 'next/link';

const APPS = [
  { title: 'IS Policies',           url: '/portal/policy.html',       icon: 'fa-shield',          color: '#1c84c6' },
  { title: 'Security News',         url: '/portal/news.html',         icon: 'fa-newspaper-o',     color: '#23c6c8' },
  { title: 'Activities',            url: '/portal/activities.html',   icon: 'fa-calendar',        color: '#1ab394' },
  { title: 'Incident Reporting',    url: '/portal/quality-alert.html',icon: 'fa-exclamation-triangle', color: '#e2231a' },
  { title: 'Training Library',      url: '/portal/training.html',     icon: 'fa-book',            color: '#f8ac59' },
];

export default function IsPortalPage() {
  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title">
              <h5>
                <i className="fa fa-shield" style={{ marginRight: 8, color: '#e2231a' }} />
                IS Portal — Information Security
              </h5>
            </div>
            <div className="ibox-content">
              <p style={{ fontSize: 14, color: '#555' }}>
                Central hub for information-security policies, incident reporting and security training.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {APPS.map(a => (
          <div className="col-md-4 col-sm-6" key={a.title}>
            <Link href={a.url} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="ibox float-e-margins" style={{ cursor: 'pointer' }}>
                <div className="ibox-content" style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: a.color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <i className={`fa ${a.icon}`} style={{ fontSize: 24, color: a.color }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{a.title}</h4>
                    <small style={{ color: '#888' }}>Open →</small>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
