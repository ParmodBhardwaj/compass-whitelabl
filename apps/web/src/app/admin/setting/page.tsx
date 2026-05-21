'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface HeroSetting {
  id: number;
  title?: string;
  settingId?: string;
  settingValue?: string;
  settingGroup?: string;
  storeId?: number;
}

/**
 * /admin/setting — Application settings key-value store.
 * Mirrors legacy `lmcadmin/setting`.
 *
 * `settingGroup` is an ENUM in the DB — the dropdown options below match
 * the enum values exactly so the legacy admin and new admin agree on
 * which bucket each setting belongs to.
 */
const SETTING_GROUPS = [
  'general', 'gallery', 'cache', 'home', 'cron',
  'role-Management', 'activity-tracker', 'kpoint',
  'visitor', 'finance', 'tpm',
];

export default function SettingAdminPage() {
  return (
    <MasterDataPanel<HeroSetting>
      title="Settings"
      entityName="Setting"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Settings' }]}
      apiPath="/settings"
      blank={{
        title: '', settingId: '', settingValue: '',
        settingGroup: 'general', storeId: 1,
      }}
      searchableKeys={['title', 'settingId', 'settingValue']}
      columns={[
        { header: 'Id',         width: 60,  cell: (r) => r.id },
        { header: 'Title',      cell: (r) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
        { header: 'Setting ID', cell: (r) => <code style={{ background: '#f6f6f6', padding: '2px 6px', borderRadius: 3, fontSize: 12 }}>{r.settingId}</code> },
        { header: 'Value',      cell: (r) => <span style={{ fontSize: 12, color: '#555' }}>{r.settingValue ?? ''}</span> },
        {
          header: 'Group', width: 140,
          cell: (r) => (
            <span style={{
              background: '#1c84c622', color: '#1c84c6',
              borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 600,
            }}>
              {r.settingGroup}
            </span>
          ),
        },
        { header: 'Store', width: 70, cell: (r) => r.storeId ?? 1 },
      ]}
      fields={[
        { name: 'title',        label: 'Title',         required: true },
        { name: 'settingId',    label: 'Setting Key',   required: true, placeholder: 'e.g. portal.home_banner_count' },
        { name: 'settingValue', label: 'Value',         type: 'textarea' },
        {
          name: 'settingGroup', label: 'Group',         type: 'select', required: true,
          options: SETTING_GROUPS.map(g => ({ value: g, label: g })),
        },
        { name: 'storeId',      label: 'Store ID',      type: 'number' },
      ]}
    />
  );
}
