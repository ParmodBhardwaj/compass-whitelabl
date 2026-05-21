'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

interface Section { id: number; sectionName?: string; name?: string; }
interface Line { id: number; lineName?: string; name?: string; }
interface Machine { id: number; machineName?: string; name?: string; }
interface Group { id: number; groupName?: string; name?: string; }

export default function LogOeePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    plantId: 1,
    sectionId: 0,
    lineId: 0,
    machineId: 0,
    groupId: 0,
    shift: 'A',
    requestDate: today,
    availableTime: '',
    stdCycleTime: '',
    actualCycleTime: '',
    productionPlan: '',
    productionActual: '',
    netProduction: '',
    rejection: '0',
    rework: '0',
    speedLoss: '0',
    shutDownLoss: '0',
    rejectionLoss: '0',
    reworkLoss: '0',
    identifiedLoss: '0',
    undefinedLoss: '0',
    totalLoss: '0',
    remarks: '',
    ecNo: '',
    ecName: '',
  });

  useEffect(() => {
    (async () => {
      const me = await apiFetch<{ id: number }>('/auth/me');
      setUserId(me.id);
      const secs = await apiFetch<Section[]>('/oee/sections');
      setSections(secs);
    })();
  }, []);

  async function onSectionChange(id: number) {
    setForm(f => ({ ...f, sectionId: id, lineId: 0, machineId: 0, groupId: 0 }));
    setLines([]); setMachines([]); setGroups([]);
    if (id) {
      const [lns, grps] = await Promise.all([
        apiFetch<Line[]>(`/oee/lines?sectionId=${id}`),
        apiFetch<Group[]>(`/oee/groups?sectionId=${id}`),
      ]);
      setLines(lns);
      setGroups(grps);
    }
  }

  async function onLineChange(id: number) {
    setForm(f => ({ ...f, lineId: id, machineId: 0 }));
    setMachines([]);
    if (id) {
      const mcs = await apiFetch<Machine[]>(`/oee/machines?lineId=${id}`);
      setMachines(mcs);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sectionId || !form.lineId || !form.availableTime || !form.netProduction) {
      setError('Section, Line, Available Time, and Net Production are required.');
      return;
    }
    if (!userId) return;
    setSaving(true);
    setError('');
    try {
      const created = await apiFetch<{ id: number }>('/oee/requests', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          availableTime: +form.availableTime,
          stdCycleTime: +form.stdCycleTime,
          actualCycleTime: +form.actualCycleTime,
          speedLoss: +form.speedLoss,
          rework: +form.rework,
          rejectionLoss: form.rejectionLoss,
          reworkLoss: +form.reworkLoss,
          identifiedLoss: +form.identifiedLoss,
          createdBy: userId,
        }),
      });
      router.push(`/portal/oee/${created.id}`);
    } catch {
      setError('Failed to save OEE entry. Please try again.');
    }
    setSaving(false);
  }

  function F(label: string, key: keyof typeof form, type = 'number', required = false) {
    return (
      <div className="form-group">
        <label>{label}{required && <span className="text-danger"> *</span>}</label>
        <input className="form-control" type={type}
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
      </div>
    );
  }

  return (
    <>
      <div className="row wrapper border-bottom white-bg page-heading" style={{ margin: '0 -15px 0 -15px' }}>
        <div className="col-lg-10">
          <h2>Log OEE Entry</h2>
          <ol className="breadcrumb">
            <li><Link href="/portal">Home</Link></li>
            <li><Link href="/portal/oee">OEE</Link></li>
            <li className="active"><strong>Log Entry</strong></li>
          </ol>
        </div>
      </div>

      <div className="wrapper wrapper-content animated fadeInRight" style={{ padding: '20px 0' }}>
        <div className="row">
          <div className="col-md-10 col-md-offset-1">
            <div className="ibox float-e-margins">
              <div className="ibox-title"><h5 style={{ margin: 0 }}>New OEE Entry</h5></div>
              <div className="ibox-content">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>

                  {/* Row 1: Section / Line / Machine / Group */}
                  <div className="row">
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Section <span className="text-danger">*</span></label>
                        <select className="form-control" value={form.sectionId}
                          onChange={e => onSectionChange(+e.target.value)}>
                          <option value={0}>— Select section —</option>
                          {sections.map(s => (
                            <option key={s.id} value={s.id}>{s.sectionName ?? s.name ?? `#${s.id}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Line <span className="text-danger">*</span></label>
                        <select className="form-control" value={form.lineId}
                          onChange={e => onLineChange(+e.target.value)} disabled={!lines.length}>
                          <option value={0}>— Select line —</option>
                          {lines.map(l => (
                            <option key={l.id} value={l.id}>{l.lineName ?? l.name ?? `#${l.id}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Machine</label>
                        <select className="form-control" value={form.machineId}
                          onChange={e => setForm(f => ({ ...f, machineId: +e.target.value }))} disabled={!machines.length}>
                          <option value={0}>— Select machine —</option>
                          {machines.map(m => (
                            <option key={m.id} value={m.id}>{m.machineName ?? m.name ?? `#${m.id}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Group</label>
                        <select className="form-control" value={form.groupId}
                          onChange={e => setForm(f => ({ ...f, groupId: +e.target.value }))} disabled={!groups.length}>
                          <option value={0}>— Select group —</option>
                          {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.groupName ?? g.name ?? `#${g.id}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Date / Shift */}
                  <div className="row">
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>Request Date <span className="text-danger">*</span></label>
                        <input type="date" className="form-control" value={form.requestDate}
                          onChange={e => setForm(f => ({ ...f, requestDate: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-2">
                      <div className="form-group">
                        <label>Shift</label>
                        <select className="form-control" value={form.shift}
                          onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}>
                          <option value="A">Shift A</option>
                          <option value="B">Shift B</option>
                          <option value="C">Shift C</option>
                          <option value="G">General</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <hr style={{ margin: '8px 0 16px' }} />
                  <h5 style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 12 }}>Time Parameters (minutes)</h5>

                  <div className="row">
                    <div className="col-sm-3">{F('Available Time', 'availableTime', 'number', true)}</div>
                    <div className="col-sm-3">{F('Std Cycle Time', 'stdCycleTime', 'number', true)}</div>
                    <div className="col-sm-3">{F('Actual Cycle Time', 'actualCycleTime', 'number', true)}</div>
                    <div className="col-sm-3">{F('Shutdown Loss', 'shutDownLoss')}</div>
                  </div>

                  <hr style={{ margin: '8px 0 16px' }} />
                  <h5 style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 12 }}>Production (units)</h5>

                  <div className="row">
                    <div className="col-sm-3">{F('Production Plan', 'productionPlan', 'number', true)}</div>
                    <div className="col-sm-3">{F('Production Actual', 'productionActual', 'number', true)}</div>
                    <div className="col-sm-3">{F('Net Production', 'netProduction', 'number', true)}</div>
                    <div className="col-sm-3">{F('Rejection', 'rejection')}</div>
                  </div>
                  <div className="row">
                    <div className="col-sm-3">{F('Rework (units)', 'rework')}</div>
                    <div className="col-sm-3">{F('Speed Loss', 'speedLoss')}</div>
                    <div className="col-sm-3">{F('Rejection Loss', 'rejectionLoss')}</div>
                    <div className="col-sm-3">{F('Rework Loss', 'reworkLoss')}</div>
                  </div>
                  <div className="row">
                    <div className="col-sm-3">{F('Identified Loss', 'identifiedLoss')}</div>
                    <div className="col-sm-3">{F('Undefined Loss', 'undefinedLoss')}</div>
                    <div className="col-sm-3">{F('Total Loss', 'totalLoss')}</div>
                  </div>

                  <hr style={{ margin: '8px 0 16px' }} />
                  <h5 style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 12 }}>Additional Info</h5>

                  <div className="row">
                    <div className="col-sm-3">
                      <div className="form-group">
                        <label>EC No.</label>
                        <input className="form-control" value={form.ecNo}
                          onChange={e => setForm(f => ({ ...f, ecNo: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-5">
                      <div className="form-group">
                        <label>EC Name</label>
                        <input className="form-control" value={form.ecName}
                          onChange={e => setForm(f => ({ ...f, ecName: e.target.value }))} />
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label>Remarks</label>
                        <textarea className="form-control" rows={2} value={form.remarks}
                          onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 4 }} />Saving…</> : 'Save OEE Entry'}
                    </button>
                    <Link href="/portal/oee" className="btn btn-white">Cancel</Link>
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
