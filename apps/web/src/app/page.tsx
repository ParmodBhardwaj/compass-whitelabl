import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ color: 'var(--hero-red)' }}>{BRAND.productName}</h1>
      <p>{BRAND.tagline}</p>
      <ul>
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/portal">Portal (post-login shell)</Link></li>
      </ul>
    </main>
  );
}
