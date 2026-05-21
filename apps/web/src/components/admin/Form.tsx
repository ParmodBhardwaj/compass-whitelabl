'use client';
import type { ReactNode } from 'react';

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 100 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', padding: 24, borderRadius: 12, minWidth: 520, maxWidth: '92vw', maxHeight: '92vh', overflow: 'auto' }}
      >
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block', marginTop: 12 }}>
      <div style={{ fontSize: 12, color: 'var(--hero-muted)', marginBottom: 4 }}>{label}</div>
      <div>{children}</div>
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--hero-border)',
  borderRadius: 6,
  font: 'inherit',
};

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...inputStyle, ...props.style }} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Actions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
      <button onClick={onCancel} style={{ padding: '8px 14px', border: '1px solid var(--hero-border)', borderRadius: 6, background: 'white' }}>
        Cancel
      </button>
      <button onClick={onSave} style={{ padding: '8px 14px', border: 0, borderRadius: 6, background: 'var(--hero-red)', color: 'white', fontWeight: 600 }}>
        Save
      </button>
    </div>
  );
}
