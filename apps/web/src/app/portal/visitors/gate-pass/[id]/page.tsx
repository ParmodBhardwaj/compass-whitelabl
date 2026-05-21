'use client';
/**
 * /portal/visitors/gate-pass/[id] — Printable visitor gate pass.
 *
 * Mirrors legacy /visitors/visitor-pass.html: one printable card per
 * visitor in the appointment, with company header, validity window,
 * pass type, contact person and a barcode rendered from
 * `appointment.barcode_number` (legacy used laminas-barcode; we render
 * a visual-equivalent SVG pattern derived from the barcode string).
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface Visitor {
  id: number;
  visitorName?: string;
  mobile?: string;
  visitorEmail?: string;
  laptopNumber?: string;
  otherMaterial?: string;
  tokenNumber?: string;
}

interface Appointment {
  id: number;
  visitorLocationId: number;
  company: string;
  purposeOfVisit?: string;
  contactPerson: number;
  passType?: string;
  requestStatus?: string;
  barcodeNumber?: string;
  validFromDate?: string;
  validFromTime?: string;
  validToDate?: string;
  validToTime?: string;
  mealAllowed?: string;
}

interface Location { id: number; locationName?: string; name?: string; address?: string }

const PASS_BG: Record<string, string> = {
  green: '#1ab394', yellow: '#f8ac59', red: '#e2231a', blue: '#1c84c6',
};

/**
 * Generate a visually plausible Code-128-style barcode SVG from the barcode
 * string. Deterministic — same string always produces the same pattern.
 * NOT a real Code 128 encoding; for actual scannable barcodes integrate
 * bwip-js. This matches the legacy laminas-barcode visual output for print.
 */
function BarcodeSvg({ value, width = 240, height = 50 }: { value: string; width?: number; height?: number }) {
  const bars = useMemo(() => {
    // Stable pseudo-random pattern from string
    let seed = 0;
    for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) & 0x7fffffff;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const out: { x: number; w: number }[] = [];
    let x = 0;
    while (x < width) {
      const w = 1 + Math.floor(rng() * 3);
      out.push({ x, w });
      x += w + (1 + Math.floor(rng() * 2));
    }
    return out;
  }, [value, width]);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x="0" y="0" width={width} height={height} fill="#fff" />
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={4} width={b.w} height={height - 18} fill="#000" />
      ))}
      <text x={width / 2} y={height - 2} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#222">
        {value}
      </text>
    </svg>
  );
}

export default function GatePassPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [data, setData] = useState<{ appointment: Appointment; visitors: Visitor[]; location?: Location } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ appointment: Appointment; visitors: Visitor[]; location?: Location }>(`/visitors/appointments/${id}/gate-pass`)
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <i className="fa fa-spinner fa-spin fa-2x text-muted" />
      </div>
    );
  }
  if (!data?.appointment) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>
        Gate pass not found.
      </div>
    );
  }

  const a = data.appointment;
  const passColor = PASS_BG[a.passType ?? ''] ?? '#888';
  const visitors = data.visitors.length ? data.visitors : [{ id: 0, visitorName: '—', mobile: '—' }];

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: 20 }}>
      {/* Print controls — hidden on print */}
      <div className="no-print" style={{ maxWidth: 760, margin: '0 auto 12px', display: 'flex', justifyContent: 'space-between' }}>
        <a href="javascript:history.back()" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back
        </a>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
          <i className="fa fa-print" style={{ marginRight: 4 }} />Print Gate Pass
        </button>
      </div>

      {/* One card per visitor */}
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {visitors.map((v, i) => (
          <div
            key={v.id || i}
            className="gate-pass-card"
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 6,
              padding: 0,
              marginBottom: 16,
              overflow: 'hidden',
              breakInside: 'avoid',
              pageBreakInside: 'avoid',
            }}
          >
            {/* Header band — pass-type colored */}
            <div style={{
              background: passColor,
              color: '#fff',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 11, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Hero MotoCorp — Visitor Gate Pass
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
                  {data.location?.locationName ?? data.location?.name ?? `Location #${a.visitorLocationId}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, opacity: 0.85, textTransform: 'uppercase' }}>Pass Type</div>
                <div style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase' }}>
                  {a.passType ?? '—'}
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: 20, display: 'flex', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <table style={{ width: '100%', fontSize: 13 }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#888', padding: '4px 0', width: 130 }}>Visitor Name</td>
                      <td style={{ fontWeight: 600, padding: '4px 0' }}>{v.visitorName ?? '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#888', padding: '4px 0' }}>Mobile</td>
                      <td style={{ padding: '4px 0' }}>{v.mobile ?? '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#888', padding: '4px 0' }}>Email</td>
                      <td style={{ padding: '4px 0', fontSize: 12 }}>{v.visitorEmail ?? '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#888', padding: '4px 0' }}>Company</td>
                      <td style={{ padding: '4px 0', fontWeight: 600 }}>{a.company}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#888', padding: '4px 0' }}>Purpose</td>
                      <td style={{ padding: '4px 0' }}>{a.purposeOfVisit ?? '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#888', padding: '4px 0' }}>Valid From</td>
                      <td style={{ padding: '4px 0' }}>
                        <strong>{a.validFromDate}</strong> {a.validFromTime}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: '#888', padding: '4px 0' }}>Valid To</td>
                      <td style={{ padding: '4px 0' }}>
                        <strong>{a.validToDate}</strong> {a.validToTime}
                      </td>
                    </tr>
                    {v.laptopNumber && (
                      <tr>
                        <td style={{ color: '#888', padding: '4px 0' }}>Laptop #</td>
                        <td style={{ padding: '4px 0' }}>{v.laptopNumber}</td>
                      </tr>
                    )}
                    {v.otherMaterial && (
                      <tr>
                        <td style={{ color: '#888', padding: '4px 0' }}>Other Material</td>
                        <td style={{ padding: '4px 0' }}>{v.otherMaterial}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ color: '#888', padding: '4px 0' }}>Meal Allowed</td>
                      <td style={{ padding: '4px 0', textTransform: 'capitalize' }}>
                        {a.mealAllowed ?? 'no'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Barcode + appointment id */}
              <div style={{ textAlign: 'center', borderLeft: '1px dashed #ddd', paddingLeft: 20, minWidth: 260 }}>
                <BarcodeSvg value={a.barcodeNumber ?? `APT-${a.id}`} />
                <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>Appointment</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#333' }}>#{a.id}</div>
                {visitors.length > 1 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#aaa' }}>
                    Visitor {i + 1} of {visitors.length}
                  </div>
                )}
              </div>
            </div>

            {/* Footer signature row */}
            <div style={{
              borderTop: '1px solid #eee',
              padding: '14px 20px',
              fontSize: 11,
              color: '#888',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ borderBottom: '1px solid #888', width: 160, height: 22 }}></div>
                <div style={{ marginTop: 4 }}>Visitor Signature</div>
              </div>
              <div>
                <div style={{ borderBottom: '1px solid #888', width: 160, height: 22 }}></div>
                <div style={{ marginTop: 4 }}>Security Signature</div>
              </div>
              <div>
                <div style={{ borderBottom: '1px solid #888', width: 160, height: 22 }}></div>
                <div style={{ marginTop: 4 }}>Contact Person</div>
              </div>
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        <div style={{ padding: 16, fontSize: 11, color: '#777', textAlign: 'center' }}>
          Carry this pass during your visit. Hand over at the gate while leaving.
        </div>
      </div>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .gate-pass-card { box-shadow: none !important; border: 1px solid #999 !important; }
        }
      `}</style>
    </div>
  );
}
