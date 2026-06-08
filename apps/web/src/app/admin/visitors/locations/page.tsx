'use client';
/**
 * /admin/visitors/locations — Visitor Locations admin.
 * Backs `visitor_locations` (plant code, pass day, video, OTP, …).
 */
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Location { id: number; [k: string]: any }

const YES_NO = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];
const ZERO_ONE = [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }];

export default function LocationsAdminPage() {
  return (
    <MasterDataPanel<Location>
      title="Visitors — Locations"
      entityName="Location"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Visitors' }, { label: 'Locations' }]}
      apiPath="/visitors/admin/locations"
      blank={{
        name: '', locationCode: '',
        passDay: 'single', passVisibleGradeWise: '0', requiredApproval: 'no',
        maxDaysAllowed: 1, sentOtp: '0', videoVisible: '0', videoValidityDays: 0,
        safetyVideoUrl: '', safetyVideoStatus: '0',
      }}
      searchableKeys={['name', 'locationCode']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Location', cell: (r) => <strong>{r.name}</strong> },
        { header: 'Code', cell: (r) => <code style={{ fontSize: 12 }}>{r.locationCode ?? '—'}</code> },
        { header: 'Pass Day', cell: (r) => <span style={{ textTransform: 'capitalize' }}>{r.passDay ?? '—'}</span> },
        { header: 'Approval?', width: 90, cell: (r) => <span style={{ textTransform: 'capitalize' }}>{r.requiredApproval ?? '—'}</span> },
        { header: 'Max Days', width: 80, cell: (r) => r.maxDaysAllowed ?? '—' },
        { header: 'OTP', width: 60, cell: (r) => r.sentOtp === '1' ? 'Yes' : 'No' },
      ]}
      fields={[
        { name: 'name',                  label: 'Location Name',          required: true },
        { name: 'locationCode',          label: 'Location Code' },
        { name: 'passDay',               label: 'Pass Day Type',          type: 'select', options: [{ value: 'single', label: 'Single Day' }, { value: 'mutiple', label: 'Multiple Days' }] },
        { name: 'maxDaysAllowed',        label: 'Max Days Allowed',       type: 'number' },
        { name: 'requiredApproval',      label: 'Require Approval',       type: 'select', options: YES_NO },
        { name: 'passVisibleGradeWise',  label: 'Pass Visible Grade-Wise',type: 'select', options: ZERO_ONE },
        { name: 'sentOtp',               label: 'Send OTP',               type: 'select', options: ZERO_ONE },
        { name: 'videoVisible',          label: 'Show Safety Video',      type: 'select', options: ZERO_ONE },
        { name: 'videoValidityDays',     label: 'Video Validity (days)',  type: 'number' },
        { name: 'safetyVideoUrl',        label: 'Safety Video URL' },
        { name: 'safetyVideoStatus',     label: 'Safety Video Status',    type: 'select', options: ZERO_ONE },
      ]}
    />
  );
}
