'use client';
import { useEffect, useState } from 'react';
import type { Banner } from '@/lib/api';
import { resolveImage } from '@/lib/legacy-url';

function resolve(image?: string) {
  return resolveImage(image, 'banners') ?? '';
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const main = banners.length ? banners : [{ id: 0, image: '', title: 'Welcome', url: '#' } as Banner];

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % main.length), 5000);
    return () => clearInterval(t);
  }, [main.length]);

  const b = main[idx];
  return (
    <div className="ibox" style={{ marginBottom: 0, flex: '1 1 auto', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div className="ibox-content" style={{ padding: 0, borderRadius: 4, overflow: 'hidden', position: 'relative', flex: '1 1 auto', display: 'flex' }}>
        <a href={b.url ?? '#'} style={{ display: 'block', width: '100%', flex: '1 1 auto' }}>
          <img
            src={resolve(b.image)}
            alt={b.title ?? ''}
            style={{ width: '100%', height: '100%', display: 'block', maxHeight: 420, objectFit: 'cover', background: '#000' }}
          />
        </a>
        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center' }}>
          {main.map((_, i) => (
            <span
              key={i}
              onClick={() => setIdx(i)}
              style={{
                display: 'inline-block',
                width: 12,
                height: 4,
                borderRadius: 2,
                margin: '0 3px',
                background: i === idx ? '#e2231a' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
