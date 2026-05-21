import Link from 'next/link';

const cards = [
  { href: '/admin/pages', icon: 'fa-file-text-o', label: 'CMS Pages', desc: 'Manage content pages' },
  { href: '/admin/news', icon: 'fa-newspaper-o', label: 'News', desc: 'Manage news articles' },
  { href: '/admin/gallery', icon: 'fa-picture-o', label: 'Gallery', desc: 'Gallery & categories' },
  { href: '/admin/banners', icon: 'fa-image', label: 'Banners', desc: 'Portal carousel banners' },
  { href: '/admin/menu', icon: 'fa-bars', label: 'Menu', desc: 'Header & sidebar nav' },
  { href: '/admin/policy', icon: 'fa-shield', label: 'Policy', desc: 'Policy documents' },
  { href: '/admin/employees', icon: 'fa-users', label: 'Employees', desc: 'Employee directory' },
  { href: '/admin/activities', icon: 'fa-calendar', label: 'Activities', desc: 'Activity tracker' },
];

export default function AdminDashboard() {
  return (
    <>
      {/* Page heading */}
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-lg-10">
          <h2>Dashboard</h2>
          <ol className="breadcrumb">
            <li className="active"><strong>Home</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="row">
          {cards.map(c => (
            <div key={c.href} className="col-lg-3 col-md-4 col-sm-6">
              <Link href={c.href} style={{ textDecoration: 'none' }}>
                <div className="ibox float-e-margins" style={{ cursor: 'pointer', transition: 'box-shadow .2s' }}>
                  <div className="ibox-content" style={{ textAlign: 'center', padding: 24 }}>
                    <i className={`fa ${c.icon}`} style={{ fontSize: 36, color: '#1ab394', marginBottom: 12, display: 'block' }} />
                    <h4 style={{ margin: '0 0 4px', fontWeight: 600 }}>{c.label}</h4>
                    <p style={{ margin: 0, color: '#999', fontSize: 13 }}>{c.desc}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
