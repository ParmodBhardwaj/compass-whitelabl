'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Ride {
  id: number;
  [k: string]: any;
}

/**
 * /admin/cp/rides — Car Pool ride offers.
 * Read-only-ish CRUD over `cp_ride_offers` (the legacy backend allows
 * admins to disable a ride; full creation goes through the portal).
 */
export default function RideAdminPage() {
  return (
    <MasterDataPanel<Ride>
      title="Car Pool — Rides"
      entityName="Ride"
      breadcrumb={[{label:'Home',href:'/admin'},{label:'Car Pool'},{label:'Rides'}]}
      apiPath="/cp/rides"
      blank={{offeredBy:0, fromLocation:0, toCity:0, toLocation:'', arivalTime:'', departureTime:'', car:'', status:'1'}}
      searchableKeys={['toLocation','car']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Offered By', width: 110, cell: (r) => r.offeredBy ?? r.offered_by ?? '—' },
        { header: 'From', width: 90, cell: (r) => r.fromLocation ?? r.from_location ?? '—' },
        { header: 'To', cell: (r) => <span style={{ fontWeight: 600 }}>{r.toLocation ?? r.to_location}</span> },
        { header: 'Arrival',  width: 90, cell: (r) => r.arivalTime ?? r.arival_time },
        { header: 'Depart',   width: 90, cell: (r) => r.departureTime ?? r.departure_time },
        { header: 'Car', cell: (r) => r.car ?? '—' },
        {
          header: 'Status', width: 100,
          cell: (r) => (
            <span style={{
              background: r.status === '1' ? '#1ab394' : '#ed5565',
              color: '#fff', borderRadius: 10, padding: '2px 10px',
              fontSize: 11, fontWeight: 700,
            }}>
              {r.status === '1' ? 'Active' : 'Disabled'}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'offeredBy', label: 'Offered By (User ID)', type: 'number', required: true },
        { name: 'fromLocation', label: 'From Location ID', type: 'number', required: true },
        { name: 'toCity', label: 'To City ID', type: 'number' },
        { name: 'toLocation', label: 'To Location', required: true },
        { name: 'arivalTime', label: 'Arrival (HH:MM)', placeholder: '09:00' },
        { name: 'departureTime', label: 'Departure (HH:MM)', placeholder: '18:00' },
        { name: 'car', label: 'Car / Vehicle' },
        {
          name: 'status', label: 'Status', type: 'select',
          options: [{ value: '1', label: 'Active' }, { value: '0', label: 'Disabled' }],
        },
      ]}
    />
  );
}
