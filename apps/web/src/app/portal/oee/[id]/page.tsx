'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface OeeRequest {
  id: number;
  requestDate: string;
  shift?: string;
  plantId?: number;
  sectionId?: number;
  lineId?: number;
  machineId?: number;
  groupId?: number;
  availableTime?: number;
  stdCycleTime?: number;
  actualCycleTime?: number;
  shutDownLoss?: string;
  productionPlan?: string;
  productionActual?: string;
  netProduction?: string;
  rejection?: string;
  rework?: number;
  speedLoss?: number;
  rejectionLoss?: string;
  reworkLoss?: number;
  identifiedLoss?: number;
  undefinedLoss?: string;
  totalLoss?: string;
  oee?: string;
  availabilityRate?: string;
  performanceRate?: string;
  qualityRate?: string;
  remarks?: string;
  ecNo?: string;
  ecName?: string;
  editCount?: number;
  createdBy?: number;
  createdAt?: string;
}

function RateGauge({ label, value }: { label: string; value: string | undefined }) {
  const pct = parseFloat(value ?? '0');
  const color = pct >= 85 ? '#1ab394' : pct >= 65 ? '#f8ac59' : '#ed5565';
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', margin: '0 auto 8px',
        background: `conic-gradient(${color} ${pct * 3.6}deg, #e7eaec 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 0 0 10px #fff',
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function OeeDetailPage() {
  const params = useParams<{ id: string }>();
  const [userId, setUserId] = useState<number | null>(null);
  const [req, setReq] = useState<OeeRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [me, data] = await Promise.all([
          apiFetch<{ id: number }>('/auth/me'),
          apiFetch<OeeRequest>(`/oee/requests/${params.id}`),
        ]);
        setUserId(me.id);
        setReq(data);
      } catch {}
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="ibox"><div className="ibox-content text-center" style={{ padding: 40 }}>
          <i className="fa fa-spinner fa-spin fa-2x text-muted" />
        </div></div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="wrapper wrapper-content">
        <div className="alert alert-danger">OEE entry not found.</div>
        <Link href="/portal/oee" className="btn btn-white btn-sm">Back</Link>
      </div>
    );
  }

  const oeePct = parseFloat(req.oee ?? '0');
  const oeeColor = oeePct >= 85 ? '#1ab394' : oeePct >= 65 ? '#f8ac59' : '#ed5565';
  const oeeLabel = oeePct >= 85 ? 'Good' : oeePct >= 65 ? 'Average' : 'Poor';

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>OEE Entry #{req.id}</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/oee">OEE</Link></li>
            <li className="active"><strong>#{req.id}</strong></li>
          </ol>
        </div>
        <div className="col-lg-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 12, fontWeight: 700, fontSize: 14,
            background: oeeColor, color: '#fff',
          }}>
            {oeePct.toFixed(2)}% OEE
          </span>
          <span className="label label-default" style={{ fontSize: 11 }}>{oeeLabel}</span>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>

        {/* OEE Rate gauges */}
        <div className="ibox float-e-margins">
          <div className="ibox-title"><h5 style={{ margin: 0 }}>OEE Breakdown</h5></div>
          <div className="ibox-content">
            <div className="row text-center">
              <div className="col-sm-3">
                <div style={{ fontSize: 36, fontWeight: 800, color: oeeColor }}>{oeePct.toFixed(2)}%</div>
                <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>OEE</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>= A × P × Q</div>
              </div>
              <div className="col-sm-3">
                <RateGauge label="Availability" value={req.availabilityRate} />
              </div>
              <div className="col-sm-3">
                <RateGauge label="Performance" value={req.performanceRate} />
              </div>
              <div className="col-sm-3">
                <RateGauge label="Quality" value={req.qualityRate} />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            {/* Time parameters */}
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Time Parameters</h5></div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {[
                  { label: 'Available Time', value: `${req.availableTime ?? '—'} min` },
                  { label: 'Std Cycle Time', value: `${req.stdCycleTime ?? '—'} min` },
                  { label: 'Actual Cycle Time', value: `${req.actualCycleTime ?? '—'} min` },
                  { label: 'Shutdown Loss', value: `${req.shutDownLoss ?? '0'} min` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', padding: '9px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 140, fontSize: 12, color: '#999', textTransform: 'uppercase', flexShrink: 0 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Losses */}
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Loss Analysis</h5></div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {[
                  { label: 'Speed Loss', value: req.speedLoss ?? 0 },
                  { label: 'Rejection Loss', value: req.rejectionLoss ?? '0' },
                  { label: 'Rework Loss', value: req.reworkLoss ?? 0 },
                  { label: 'Identified Loss', value: req.identifiedLoss ?? 0 },
                  { label: 'Undefined Loss', value: req.undefinedLoss ?? '0' },
                  { label: 'Total Loss', value: req.totalLoss ?? '0' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', padding: '9px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 140, fontSize: 12, color: '#999', textTransform: 'uppercase', flexShrink: 0 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            {/* Production */}
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Production Data</h5></div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {[
                  { label: 'Production Plan', value: req.productionPlan ?? '—' },
                  { label: 'Production Actual', value: req.productionActual ?? '—' },
                  { label: 'Net Production', value: req.netProduction ?? '—' },
                  { label: 'Rejection', value: req.rejection ?? '0' },
                  { label: 'Rework', value: req.rework ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', padding: '9px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 140, fontSize: 12, color: '#999', textTransform: 'uppercase', flexShrink: 0 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Entry info */}
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Entry Info</h5></div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {[
                  { label: 'Date', value: req.requestDate },
                  { label: 'Shift', value: req.shift ? `Shift ${req.shift}` : '—' },
                  { label: 'Section', value: `#${req.sectionId ?? '—'}` },
                  { label: 'Line', value: `#${req.lineId ?? '—'}` },
                  { label: 'Machine', value: req.machineId ? `#${req.machineId}` : '—' },
                  { label: 'EC No.', value: req.ecNo || '—' },
                  { label: 'EC Name', value: req.ecName || '—' },
                  { label: 'Logged By', value: `Employee #${req.createdBy}` },
                  { label: 'Edit Count', value: req.editCount ?? 0 },
                  { label: 'Logged At', value: req.createdAt ? new Date(req.createdAt).toLocaleString() : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', padding: '9px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 110, fontSize: 12, color: '#999', textTransform: 'uppercase', flexShrink: 0 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
                {req.remarks && (
                  <div style={{ padding: '9px 16px' }}>
                    <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>Remarks</div>
                    <div style={{ fontSize: 13 }}>{req.remarks}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Link href="/portal/oee" className="btn btn-white btn-sm">
          <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back to OEE
        </Link>
      </div>
    </>
  );
}
