'use client';
/**
 * /portal/hm3h — Manufacturing 3rd Horizon (HM3H) landing.
 * Mirrors legacy /hm3h/home.html.
 *
 * Backed by hm3h_pillar, hm3h_steering_committee, hm3h_kpi_data, etc.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';

interface Pillar { id: number; name?: string; description?: string; status?: string }

export default function Hm3hHomePage() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Pillar[]>('/hm3h/pillars')
      .then(rows => setPillars(Array.isArray(rows) ? rows : []))
      .catch(() => setPillars([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title">
              <h5>
                <i className="fa fa-cubes" style={{ marginRight: 8, color: '#1ab394' }} />
                HM3H — Manufacturing 3rd Horizon
              </h5>
            </div>
            <div className="ibox-content">
              <p style={{ fontSize: 14, color: '#555' }}>
                Strategic transformation programme tracking KPIs, KAI (Key Activity Indicators) and steering-committee actions across the manufacturing pillars.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title">
              <h5>Pillars</h5>
            </div>
            <div className="ibox-content">
              {loading ? (
                <p style={{ textAlign: 'center', padding: 30 }}>
                  <i className="fa fa-spinner fa-spin" />
                </p>
              ) : pillars.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: 30 }}>
                  No pillars configured yet. Use admin → HM3H to add them.
                </p>
              ) : (
                <div className="row">
                  {pillars.map(p => (
                    <div className="col-md-4 col-sm-6" key={p.id}>
                      <div className="ibox float-e-margins" style={{ marginBottom: 16 }}>
                        <div className="ibox-content" style={{ padding: 16 }}>
                          <h4 style={{ marginTop: 0, fontSize: 14, color: '#1ab394' }}>{p.name}</h4>
                          {p.description && <p style={{ fontSize: 12, color: '#777', margin: 0 }}>{p.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
                <Link href="/portal/idea.html" style={{ color: '#1c84c6' }}>
                  → Submit an HM3H idea via the Idea Portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
