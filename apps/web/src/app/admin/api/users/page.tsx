'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface ApiUser {
  id: number;
  title?: string;
  username?: string;
  password?: string;
  status?: '0' | '1';
}

/**
 * /admin/api/users — REST API user credentials.
 * Mirrors legacy `lmcadmin/api/users`. Backed by `hero_api_users`.
 *
 * Note: password is hashed server-side (bcrypt). The grid never shows it.
 * Leave the password field blank on edit to keep the existing hash.
 */
export default function ApiUsersAdminPage() {
  return (
    <MasterDataPanel<ApiUser>
      title="REST API Users"
      entityName="API User"
      breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'API Access' }, { label: 'Rest Users' }]}
      apiPath="/api-users"
      blank={{ title: '', username: '', password: '', status: '1' }}
      searchableKeys={['title', 'username']}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Title', cell: (r) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
        { header: 'Username', cell: (r) => <code style={{ background: '#f6f6f6', padding: '2px 6px', borderRadius: 3, fontSize: 12 }}>{r.username}</code> },
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
        { name: 'title',    label: 'Title',    required: true, placeholder: 'e.g. SAP Integration Bot' },
        { name: 'username', label: 'Username', required: true },
        { name: 'password', label: 'Password', placeholder: 'Leave blank on edit to keep existing' },
        {
          name: 'status', label: 'Status', type: 'select',
          options: [{ value: '1', label: 'Active' }, { value: '0', label: 'Disabled' }],
        },
      ]}
    />
  );
}
