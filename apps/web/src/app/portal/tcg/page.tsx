'use client';
/**
 * /portal/tcg — Hero Talent & Capability Grid (TCG) landing.
 * Mirrors legacy /tcg/tcg.html — reuses the R&D shared data set
 * (notice, joinees, competitor products) with TCG-specific
 * login-usage tracking.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';
import { resolveImage } from '@/lib/legacy-url';

interface Notice { id: number; description?: string }
interface Joinee {
  id: number; name?: string; designation?: string;
  description?: string; image?: string; type?: string;
}
interface CompetitorProduct {
  id: number; name?: string; price?: number | string;
  description?: string; image?: string;
}

interface Dashboard {
  notice: Notice | null;
  joinees: Joinee[];
  products: CompetitorProduct[];
  loginCount: number;
}

const QUICK_LINKS = [
  { title: 'Training Library', url: '/portal/training',         icon: 'fa-book',        color: '#1c84c6' },
  { title: 'Idea Portal',      url: '/portal/idea',             icon: 'fa-lightbulb-o', color: '#f8ac59' },
  { title: 'Activity Tracker', url: '/portal/activity-tracker', icon: 'fa-tasks',       color: '#1ab394' },
];

export default function TcgPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire-and-forget login tracking — deduped per (user, day) server-side.
    apiFetch('/tcg/track-login', { method: 'POST' }).catch(() => {});
    apiFetch<Dashboard>('/tcg/dashboard?storeId=6')
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div style={{ textAlign: 'center', padding: 80 }}>
          <i className="fa fa-spinner fa-spin" style={{ fontSize: 28, color: '#f8ac59' }} />
        </div>
      </div>
    );
  }

  const d = data ?? { notice: null, joinees: [], products: [], loginCount: 0 };

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h5 style={{ margin: 0 }}>
                <i className="fa fa-trophy" style={{ marginRight: 8, color: '#f8ac59' }} />
                TCG — Talent &amp; Capability Grid
              </h5>
              <span style={{ background: '#f8ac59', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 12 }}>
                {d.loginCount.toLocaleString('en-IN')} total visits
              </span>
            </div>
            <div className="ibox-content">
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 0 }}>
                The Hero Talent &amp; Capability Grid is our company-wide framework for mapping critical
                skills, identifying capability gaps, and planning development journeys across departments.
                Managers nominate critical roles, employees self-rate against the capability matrix,
                and L&amp;D mines the gaps to design training cohorts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice */}
      {d.notice?.description && (
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-content" style={{
                background: 'linear-gradient(90deg, #fff7e0 0%, #fff 70%)',
                borderLeft: '4px solid #f8ac59',
                display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16,
              }}>
                <i className="fa fa-bullhorn" style={{ color: '#f8ac59', fontSize: 22, marginTop: 4 }} />
                <div
                  style={{ flex: 1, fontSize: 14, color: '#555', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: d.notice.description }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Joinees */}
      {d.joinees.length > 0 && (
        <div className="row">
          <div className="col-lg-12">
            <h4 style={{ fontSize: 14, color: '#676a6c', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              <i className="fa fa-users" style={{ marginRight: 6, color: '#f8ac59' }} />
              Recent Joinees
            </h4>
          </div>
          {d.joinees.slice(0, 6).map(j => (
            <div className="col-md-4 col-sm-6" key={j.id}>
              <div className="ibox float-e-margins">
                <div className="ibox-content" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 16 }}>
                  <img
                    src={resolveImage(j.image, 'rnd') ?? '/img/profile.png'}
                    alt={j.name ?? ''}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%', border: '2px solid #fce4b6', flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile.png'; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{j.name}</div>
                    {j.designation && <div style={{ fontSize: 11, color: '#999' }}>{j.designation}</div>}
                    {j.type && (
                      <span style={{ display: 'inline-block', marginTop: 4, background: '#f8ac5933', color: '#a67423', borderRadius: 10, padding: '1px 8px', fontSize: 10, fontWeight: 600 }}>
                        {j.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="row">
        <div className="col-lg-12">
          <h4 style={{ fontSize: 14, color: '#676a6c', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            <i className="fa fa-th-large" style={{ marginRight: 6, color: '#f8ac59' }} />
            Quick Links
          </h4>
        </div>
        {QUICK_LINKS.map(a => (
          <div className="col-md-4 col-sm-6" key={a.title}>
            <Link href={a.url} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="ibox float-e-margins" style={{ cursor: 'pointer' }}>
                <div className="ibox-content" style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: a.color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
