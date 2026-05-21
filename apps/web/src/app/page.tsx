import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ color: 'var(--hero-red)' }}>Hero Compass — v2 (in progress)</h1>
      <p>Re-platform of the Laminas portal. Migration is module-by-module behind <code>/v2/</code>.</p>
      <ul>
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/portal">Portal (post-login shell)</Link></li>
      </ul>
    </main>
  );
}
