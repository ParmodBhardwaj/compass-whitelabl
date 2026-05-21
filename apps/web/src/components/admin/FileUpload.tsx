'use client';
import { useState } from 'react';
import { getToken } from '@/lib/auth';

export function FileUpload(props: { multiple?: boolean; onUploaded: (results: Array<{ url: string; filename: string }>) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <label style={{ display: 'inline-block' }}>
      <input
        type="file"
        multiple={props.multiple}
        style={{ display: 'none' }}
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length === 0) return;
          const fd = new FormData();
          for (const f of files) fd.append(props.multiple ? 'files' : 'file', f);
          setBusy(true);
          try {
            const token = getToken();
            const res = await fetch(`/api/v2/uploads/${props.multiple ? 'many' : 'one'}`, {
              method: 'POST',
              headers: token ? { authorization: `Bearer ${token}` } : {},
              body: fd,
            });
            if (!res.ok) throw new Error(`upload failed ${res.status}`);
            const data = await res.json();
            props.onUploaded(Array.isArray(data) ? data : [data]);
          } finally {
            setBusy(false);
            (e.target as HTMLInputElement).value = '';
          }
        }}
      />
      <span
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: 'var(--hero-pink)',
          border: '1px dashed var(--hero-red)',
          borderRadius: 8,
          color: 'var(--hero-red)',
          fontWeight: 600,
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy ? 'Uploading…' : props.multiple ? 'Upload files' : 'Upload file'}
      </span>
    </label>
  );
}
