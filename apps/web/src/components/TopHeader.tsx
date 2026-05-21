export function TopHeader() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 24px',
        background: 'white',
        borderBottom: '1px solid var(--hero-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 20, height: 20, background: 'var(--hero-red)', clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
        <strong style={{ color: 'var(--hero-red)', fontSize: 22 }}>Hero</strong>
      </div>
      <button aria-label="menu" style={{ background: '#eee', width: 36, height: 36, border: 0, borderRadius: 18 }}>≡</button>
      <input
        placeholder="Search here..."
        style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--hero-border)', borderRadius: 24 }}
      />
      <nav style={{ display: 'flex', gap: 18, alignItems: 'center', color: 'var(--hero-text)', fontSize: 14 }}>
        <span>Corporate ▾</span>
        <span>Portals ▾</span>
        <span>★ Policies</span>
        <span>★ Videos</span>
        <button aria-label="logout" style={{ background: 'transparent', border: 0 }}>⏻</button>
      </nav>
    </header>
  );
}
