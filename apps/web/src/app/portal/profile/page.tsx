'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/auth';
import { resolveAvatar, resolveImage } from '@/lib/legacy-url';

interface Me {
  id?: number;
  name?: string;
  email?: string;
  ecode?: string;
  profilepic?: string;
  designation?: string;
  department?: string | number;
  location?: string | number;
  grade?: string;
  mobile?: string;
  dob?: string;
  doj?: string;
}

interface Favourite {
  id: number;
  title?: string;
  url?: string;
  menuId?: number;
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me>({});
  const [favs, setFavs] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await apiFetch<Me>('/auth/me');
        setMe(user);
        // Also fetch full employee record if we have an ID
        if (user.id) {
          const emp = await apiFetch<Me>(`/employees/${user.id}`).catch(() => null);
          if (emp) setMe(prev => ({ ...prev, ...emp }));
        }
      } catch {}
      try {
        const f = await apiFetch<Favourite[]>('/favourites');
        setFavs(Array.isArray(f) ? f : []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const APP_COLORS = [
    '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
    '#3498db', '#9b59b6', '#e91e63', '#00bcd4', '#8bc34a',
    '#ff5722', '#607d8b',
  ];

  function appColor(i: number) { return APP_COLORS[i % APP_COLORS.length]; }

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <i className="fa fa-spinner fa-spin" style={{ fontSize: 28, color: '#e2231a' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        {/* ── Left panel: profile card ───────────────────────────────── */}
        <div className="col-md-4">
          <div className="ibox float-e-margins">
            <div className="ibox-content" style={{ textAlign: 'center', padding: '30px 20px' }}>
              {/* Avatar */}
              <img
                src={resolveAvatar(me.profilepic)}
                alt=""
                className="img-circle"
                style={{ width: 120, height: 120, objectFit: 'cover', border: '4px solid #e5e5e5' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile.png'; }}
              />
              <h3 style={{ marginTop: 16, marginBottom: 4, fontSize: 20, fontWeight: 700 }}>
                {me.name ?? 'User'}
              </h3>
              {me.designation && (
                <p style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>
                  {me.designation}
                </p>
              )}
              {me.ecode && (
                <span
                  style={{
                    display: 'inline-block',
                    background: '#f4f4f4',
                    border: '1px solid #e5e5e5',
                    borderRadius: 3,
                    padding: '2px 10px',
                    fontSize: 12,
                    color: '#555',
                    marginTop: 4,
                  }}
                >
                  {me.ecode}
                </span>
              )}
            </div>

            {/* Details list */}
            <div className="ibox-content" style={{ padding: '0 20px 20px' }}>
              <dl className="dl-horizontal" style={{ marginBottom: 0 }}>
                {me.email && (
                  <>
                    <dt style={dtStyle}><i className="fa fa-envelope" /> Email</dt>
                    <dd style={ddStyle}>{me.email}</dd>
                  </>
                )}
                {me.mobile && (
                  <>
                    <dt style={dtStyle}><i className="fa fa-phone" /> Mobile</dt>
                    <dd style={ddStyle}>{me.mobile}</dd>
                  </>
                )}
                {me.department && (
                  <>
                    <dt style={dtStyle}><i className="fa fa-building" /> Department</dt>
                    <dd style={ddStyle}>{me.department}</dd>
                  </>
                )}
                {me.location && (
                  <>
                    <dt style={dtStyle}><i className="fa fa-map-marker" /> Location</dt>
                    <dd style={ddStyle}>{me.location}</dd>
                  </>
                )}
                {me.grade && (
                  <>
                    <dt style={dtStyle}><i className="fa fa-star" /> Grade</dt>
                    <dd style={ddStyle}>{me.grade}</dd>
                  </>
                )}
                {me.doj && (
                  <>
                    <dt style={dtStyle}><i className="fa fa-calendar" /> Joined</dt>
                    <dd style={ddStyle}>{me.doj}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* ── Right panel: My Favourites ─────────────────────────────── */}
        <div className="col-md-8">
          <div className="ibox float-e-margins">
            <div className="ibox-title">
              <h5>
                <i className="fa fa-star" style={{ marginRight: 8, color: '#f1c40f' }} />
                My Favourites
              </h5>
            </div>
            <div className="ibox-content">
              {favs.length === 0 ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: '30px 0' }}>
                  <i className="fa fa-star-o" style={{ fontSize: 28, display: 'block', marginBottom: 12 }} />
                  No favourites yet. Star apps in the sidebar to add them here.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {favs.map((fav, i) => (
                    <a
                      key={fav.id}
                      href={fav.url ?? '#'}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 80,
                        borderRadius: 8,
                        background: appColor(i) + '22',
                        border: `1px solid ${appColor(i)}44`,
                        textDecoration: 'none',
                        padding: '8px 6px',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px ${appColor(i)}44`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = '';
                        (e.currentTarget as HTMLElement).style.boxShadow = '';
                      }}
                    >
                      <i
                        className="fa fa-th-large"
                        style={{ fontSize: 20, color: appColor(i), marginBottom: 6 }}
                      />
                      <span style={{
                        fontSize: 11,
                        color: '#444',
                        fontWeight: 600,
                        textAlign: 'center',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      } as React.CSSProperties}>
                        {fav.title ?? 'App'}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick stats ibox */}
          <div className="ibox float-e-margins">
            <div className="ibox-title">
              <h5>
                <i className="fa fa-info-circle" style={{ marginRight: 8, color: '#23c6c8' }} />
                Account Info
              </h5>
            </div>
            <div className="ibox-content">
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <StatTile icon="fa-star" label="Favourites" value={favs.length} color="#f1c40f" />
                <StatTile icon="fa-user" label="Employee ID" value={me.id ?? '—'} color="#1c84c6" />
                <StatTile icon="fa-envelope" label="Email" value={me.email ?? '—'} color="#23c6c8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const dtStyle: React.CSSProperties = {
  width: 90,
  fontSize: 12,
  color: '#999',
  fontWeight: 600,
  paddingTop: 10,
};
const ddStyle: React.CSSProperties = {
  marginLeft: 100,
  fontSize: 13,
  color: '#555',
  paddingTop: 10,
  borderTop: '1px solid #f4f4f4',
};

function StatTile({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: 110,
      padding: '16px 12px',
      borderRadius: 6,
      background: color + '18',
      border: `1px solid ${color}33`,
    }}>
      <i className={`fa ${icon}`} style={{ fontSize: 22, color, marginBottom: 8 }} />
      <div style={{ fontSize: 13, fontWeight: 700, color: '#444' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  );
}
