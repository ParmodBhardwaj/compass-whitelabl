'use client';
import Link from 'next/link';

/**
 * TPM hub — links to the three sub-portals:
 *   Hazard Redressal, OPL (One Point Lessons), Tag Redressal.
 */
export default function TpmHubPage() {
  const tiles = [
    {
      href: '/portal/tpm/hazard',
      icon: 'fa-exclamation-triangle',
      color: '#e74c3c',
      title: 'Hazard Redressal',
      desc: 'Report and track safety hazards on the shop floor. Raise a hazard card, assign to line manager, and track resolution.',
    },
    {
      href: '/portal/tpm/opl',
      icon: 'fa-lightbulb-o',
      color: '#f39c12',
      title: 'OPL — One Point Lessons',
      desc: 'Share knowledge through before/after photo cards. Submit a lesson, get pillar-lead approval, and publish to the team.',
    },
    {
      href: '/portal/tpm/hazard?applicationId=3',
      icon: 'fa-tag',
      color: '#3498db',
      title: 'Tag Redressal',
      desc: 'Machine / equipment tags raised by operators for issues needing corrective action.',
    },
  ];

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>TPM — Total Productive Maintenance</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li className="active"><strong>TPM</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '30px 0' }}>
        <div className="row">
          {tiles.map(tile => (
            <div key={tile.href} className="col-lg-4 col-md-6" style={{ marginBottom: 20 }}>
              <Link href={tile.href} style={{ textDecoration: 'none' }}>
                <div className="ibox float-e-margins" style={{ marginBottom: 0, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
                  <div style={{ background: tile.color, borderRadius: '4px 4px 0 0', padding: '28px 24px', textAlign: 'center' }}>
                    <i className={`fa ${tile.icon}`} style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />
                  </div>
                  <div className="ibox-content" style={{ padding: '20px 24px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 10px', fontWeight: 700, color: '#333' }}>{tile.title}</h4>
                    <p style={{ fontSize: 13, color: '#777', lineHeight: 1.7, margin: 0 }}>{tile.desc}</p>
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
