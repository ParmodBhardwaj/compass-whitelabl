'use client';
/**
 * Catch-all admin page — shown when an admin URL has no concrete Next.js
 * page yet. Provides a friendly "module under migration" notice instead of
 * a bare 404, so admins can still navigate the sidebar and use the portal
 * selector even on routes that haven't been ported from legacy PHP yet.
 *
 * Next.js routes more specific pages (e.g. /admin/employees, /admin/menu)
 * before this catch-all, so it only fires on unmapped URLs.
 */
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminCatchAllPage() {
  const params = useParams<{ slug?: string[] }>();
  const slugParts = params.slug ?? [];
  const routePath = '/admin/' + slugParts.join('/');
  const moduleName = slugParts[0]
    ? slugParts[0].replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
    : 'this module';

  // Legacy URL for comparison — admins can still use the PHP backend until
  // we finish porting this page.
  const legacyUrl = `http://heronewlanding.local.com${routePath}`;

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-12">
          <h2 style={{ marginTop: 0 }}>
            {moduleName}
          </h2>
          <ol className="breadcrumb" style={{ background: 'transparent', padding: 0, marginBottom: 20 }}>
            <li><Link href="/admin" style={{ color: '#1c84c6' }}>Home</Link></li>
            {slugParts.map((seg, i) => (
              <li key={i} style={{ marginLeft: 6, textTransform: 'capitalize' }}>/ {seg}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="row">
        <div className="col-md-9 col-lg-8">
          <div className="ibox float-e-margins">
            <div className="ibox-content" style={{ padding: '40px 30px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: '#fdf4f3', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  <i className="fa fa-cogs" style={{ fontSize: 32, color: '#e2231a' }} />
                </div>
                <h3 style={{ margin: '0 0 8px', color: '#333' }}>
                  Module Under Migration
                </h3>
                <p style={{ color: '#777', fontSize: 14, lineHeight: 1.6, maxWidth: 540, margin: '0 auto 24px' }}>
                  The <strong>{moduleName}</strong> admin screen has not been ported to the new
                  portal yet. It's still available on the legacy site for now —
                  the team is migrating it as part of the rolling cut-over.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={legacyUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#1ab394', color: '#fff',
                      padding: '10px 18px', borderRadius: 4,
                      textDecoration: 'none', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <i className="fa fa-external-link" style={{ marginRight: 6 }} />
                    Open in Legacy Admin
                  </a>
                  <Link
                    href="/admin"
                    style={{
                      background: '#fff', color: '#676a6c',
                      border: '1px solid #e7eaec',
                      padding: '10px 18px', borderRadius: 4,
                      textDecoration: 'none', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <i className="fa fa-arrow-left" style={{ marginRight: 6 }} />
                    Back to Dashboard
                  </Link>
                </div>
              </div>

              <hr style={{ margin: '32px 0', border: 0, borderTop: '1px solid #f4f4f4' }} />

              <div style={{ fontSize: 12, color: '#aaa' }}>
                <div style={{ marginBottom: 6 }}>
                  <strong>Requested route:</strong>{' '}
                  <code style={{ background: '#f6f6f6', padding: '2px 6px', borderRadius: 3, color: '#444' }}>
                    {routePath}
                  </code>
                </div>
                <div>
                  <strong>Legacy equivalent:</strong>{' '}
                  <code style={{ background: '#f6f6f6', padding: '2px 6px', borderRadius: 3, color: '#444' }}>
                    {legacyUrl}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
