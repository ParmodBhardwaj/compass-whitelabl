'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface HeroLocation {
  id: number;
  locationText?: string;
  location?: string;
}

/**
 * /admin/location — Plant/Office locations master.
 * Mirrors legacy `lmcadmin/location`.
 */
export default function LocationAdminPage() {
  return (
    <MasterDataPanel<HeroLocation>
      title="Locations"
      entityName="Location"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Locations' }]}
      apiPath="/locations"
      blank={{ locationText: '', location: '' }}
      searchableKeys={['locationText', 'location']}
      columns={[
        { header: 'Id',           width: 60, cell: (r) => r.id },
        { header: 'Location',     cell: (r) => <span style={{ fontWeight: 600 }}>{r.locationText}</span> },
        { header: 'Code / Alias', cell: (r) => <code style={{ background: '#f6f6f6', padding: '2px 6px', borderRadius: 3 }}>{r.location}</code> },
      ]}
      fields={[
        { name: 'locationText', label: 'Location Name', required: true, placeholder: 'e.g. Gurgaon Plant' },
        { name: 'location',     label: 'Code / Alias',  required: true, placeholder: 'e.g. gurgaon-plant' },
      ]}
    />
  );
}
