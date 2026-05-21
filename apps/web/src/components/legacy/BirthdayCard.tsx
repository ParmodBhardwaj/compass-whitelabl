'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/auth';
import { resolveAvatar } from '@/lib/legacy-url';

interface BirthdayEmployee {
  userId: number;
  name?: string;
  profilepic?: string;
  dob?: string;
}

/**
 * Replica of the legacy "Happy Birthday !!" card on the main portal —
 * cycles through employees whose DOB falls in the next 14 days.
 */
export function BirthdayCard() {
  const [list, setList] = useState<BirthdayEmployee[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    apiFetch<BirthdayEmployee[]>('/employees/birthdays?days=14')
      .then((rows) => setList(rows ?? []))
      .catch(() => setList([]));
  }, []);

  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), 4000);
    return () => clearInterval(t);
  }, [list.length]);

  const e = list[idx];

  return (
    <div className="ibox-content" style={{ padding: 24, borderRadius: 4, background: '#7a7a7a', color: 'white', minHeight: 280, position: 'relative', overflow: 'hidden', flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/legacy/img/birthday-bg.png')",
          backgroundSize: 'cover',
          opacity: 0.35,
        }}
      />
      <div style={{ position: 'relative', textAlign: 'center', paddingTop: 12 }}>
        <div style={{ width: 110, height: 110, borderRadius: '50%', background: '#bbb', margin: '0 auto', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.5)' }}>
          {e?.profilepic && (
            <img
              src={resolveAvatar(e.profilepic)}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(ev) => { (ev.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </div>
        <div style={{ marginTop: 16, fontWeight: 700, fontSize: 16 }}>Happy Birthday !!</div>
        <div style={{ marginTop: 8, fontSize: 22, fontWeight: 600 }}>
          {e?.name ?? 'No upcoming birthdays'}
        </div>
        {list.length > 1 && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', position: 'absolute', top: '50%', left: 0, right: 0 }}>
            <button onClick={() => setIdx((i) => (i - 1 + list.length) % list.length)} style={btnStyle}>‹</button>
            <button onClick={() => setIdx((i) => (i + 1) % list.length)} style={btnStyle}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 0,
  color: 'white',
  fontSize: 32,
  cursor: 'pointer',
  padding: '0 12px',
};
