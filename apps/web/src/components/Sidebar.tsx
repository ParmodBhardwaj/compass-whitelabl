const items = [
  'Search Apps',
  'Covid Resources',
  'Hero Virtual Showroom',
  'Tax Insight',
  'Employee Compliances',
  'Patent Management System',
  'CSR - Employee Volunteering',
  'GEAR',
  'Disha',
  'GST Information',
];

export function Sidebar() {
  return (
    <aside style={{ background: 'white', borderRight: '1px solid var(--hero-border)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#fafafa', borderRadius: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: '#ddd' }} />
        <div>
          <div style={{ fontWeight: 600 }}>Radhika Garg</div>
          <div style={{ color: 'var(--hero-muted)', fontSize: 12 }}>▾</div>
        </div>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0' }}>
        {items.map((label) => (
          <li
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            <span>{label}</span>
            <span style={{ color: '#ccc' }}>☆</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
