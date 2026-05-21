'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface Classification { id: number; name: string; description?: string; }

export default function NewMpRequestPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    plantId: 1,
    type: 'equipment',
    raisedBy: '',
    equipmentNo: '',
    equipmentName: '',
    section: '',
    functionLocation: '',
    subLocation: '',
    classificationId: [] as number[],
    machinePartName: '',
    noOfIncidents: '',
    costLoss: '',
    totalHoursLost: '',
    problemCategory: '',
    problemDescription: '',
    counterMeasure: '',
    proposedImprovement: '',
    effectiveness: '',
    other: '',
    // Non-equipment fields
    nonEquipmentId: '',
    nonEquipmentNo: '',
    departmentId: '',
    sectionId: '',
    nonFunctionLocation: '',
  });

  useEffect(() => {
    (async () => {
      const me = await apiFetch<{ id: number }>('/auth/me');
      setUserId(me.id);
      const cl = await apiFetch<Classification[]>('/mpsheet/classifications');
      setClassifications(cl);
    })();
  }, []);

  function toggleClass(id: number) {
    setForm(f => ({
      ...f,
      classificationId: f.classificationId.includes(id)
        ? f.classificationId.filter(x => x !== id)
        : [...f.classificationId, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = [];
    if (!form.equipmentName.trim()) missing.push('Equipment Name');
    if (!form.functionLocation.trim()) missing.push('Function Location');
    if (!form.machinePartName.trim()) missing.push('Machine Part Name');
    if (!form.problemDescription.trim()) missing.push('Problem Description');
    if (!form.counterMeasure.trim()) missing.push('Counter Measure');
    if (!form.proposedImprovement.trim()) missing.push('Proposed Improvement');
    if (!form.effectiveness.trim()) missing.push('Effectiveness');
    if (!form.problemCategory.trim()) missing.push('Problem Category');
    if (missing.length) {
      setError(`Required: ${missing.join(', ')}`);
      return;
    }
    if (!userId) return;
    setSaving(true);
    setError('');
    try {
      const created = await apiFetch<{ id: number }>('/mpsheet/requests', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          classificationId: form.classificationId.join(','),
          noOfIncidents: form.noOfIncidents ? +form.noOfIncidents : undefined,
          costLoss: form.costLoss ? +form.costLoss : undefined,
          totalHoursLost: form.totalHoursLost ? +form.totalHoursLost : undefined,
          departmentId: form.departmentId ? +form.departmentId : undefined,
          sectionId: form.sectionId ? +form.sectionId : undefined,
          createdBy: userId,
        }),
      });
      router.push(`/portal/mpsheet/${created.id}`);
    } catch {
      setError('Failed to submit request. Please try again.');
    }
    setSaving(false);
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>New MP Request</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/mpsheet">MP Sheet</Link></li>
            <li className="active"><strong>New Request</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-md-10 col-md-offset-1">
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>Maintenance Prevention Sheet</h5></div>
              <div className="ibox-content">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>

                  {/* Type */}
                  <div className="form-group">
                    <label>Request Type</label>
                    <div>
                      <label className="radio-inline">
                        <input type="radio" value="equipment" checked={form.type === 'equipment'}
                          onChange={() => setForm(f => ({ ...f, type: 'equipment' }))} />
                        {' '}Equipment
                      </label>
                      <label className="radio-inline" style={{ marginLeft: 16 }}>
                        <input type="radio" value="non-equipment" checked={form.type === 'non-equipment'}
                          onChange={() => setForm(f => ({ ...f, type: 'non-equipment' }))} />
                        {' '}Non-Equipment
                      </label>
                    </div>
                  </div>

                  <hr style={{ margin: '8px 0 16px' }} />
                  <h5 style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 12 }}>Equipment Details</h5>

                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label>Equipment Name <span className="text-danger">*</span></label>
                        <input className="form-control" value={form.equipmentName}
                          onChange={e => setForm(f => ({ ...f, equipmentName: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Equipment No.</label>
                        <input className="form-control" value={form.equipmentNo}
                          onChange={e => setForm(f => ({ ...f, equipmentNo: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-5">
                      <div className="form-group">
                        <label>Machine Part Name <span className="text-danger">*</span></label>
                        <input className="form-control" value={form.machinePartName}
                          onChange={e => setForm(f => ({ ...f, machinePartName: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label>Function Location <span className="text-danger">*</span></label>
                        <input className="form-control" value={form.functionLocation}
                          onChange={e => setForm(f => ({ ...f, functionLocation: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label>Sub Location</label>
                        <input className="form-control" value={form.subLocation}
                          onChange={e => setForm(f => ({ ...f, subLocation: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label>Section</label>
                        <input className="form-control" value={form.section}
                          onChange={e => setForm(f => ({ ...f, section: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>No. of Incidents</label>
                        <input className="form-control" type="number" value={form.noOfIncidents}
                          onChange={e => setForm(f => ({ ...f, noOfIncidents: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Cost Loss (₹)</label>
                        <input className="form-control" type="number" value={form.costLoss}
                          onChange={e => setForm(f => ({ ...f, costLoss: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Total Hours Lost</label>
                        <input className="form-control" type="number" value={form.totalHoursLost}
                          onChange={e => setForm(f => ({ ...f, totalHoursLost: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Problem Category <span className="text-danger">*</span></label>
                        <input className="form-control" value={form.problemCategory}
                          onChange={e => setForm(f => ({ ...f, problemCategory: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  {/* Classification */}
                  {classifications.length > 0 && (
                    <div className="form-group">
                      <label>Classification</label>
                      <div style={{
                        border: '1px solid #e5e6e7', borderRadius: 4, padding: '10px 12px',
                        display: 'flex', flexWrap: 'wrap', gap: 8,
                      }}>
                        {classifications.map(cl => (
                          <label key={cl.id} style={{ fontWeight: 'normal', cursor: 'pointer', marginBottom: 0 }}>
                            <input type="checkbox"
                              checked={form.classificationId.includes(cl.id)}
                              onChange={() => toggleClass(cl.id)}
                              style={{ marginRight: 4 }}
                            />
                            {cl.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <hr style={{ margin: '8px 0 16px' }} />
                  <h5 style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 12 }}>Problem Analysis</h5>

                  <div className="form-group">
                    <label>Problem Description <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows={3} value={form.problemDescription}
                      onChange={e => setForm(f => ({ ...f, problemDescription: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label>Counter Measure <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows={3} value={form.counterMeasure}
                      onChange={e => setForm(f => ({ ...f, counterMeasure: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label>Proposed Improvement <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows={3} value={form.proposedImprovement}
                      onChange={e => setForm(f => ({ ...f, proposedImprovement: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label>Effectiveness <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows={2} value={form.effectiveness}
                      onChange={e => setForm(f => ({ ...f, effectiveness: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label>Other Remarks</label>
                    <input className="form-control" value={form.other}
                      onChange={e => setForm(f => ({ ...f, other: e.target.value }))} />
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 4 }} />Submitting…</> : 'Submit Request'}
                    </button>
                    <Link href="/portal/mpsheet" className="btn btn-white">Cancel</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
