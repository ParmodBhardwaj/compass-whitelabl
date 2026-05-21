'use client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  title: string;
  breadcrumb: Array<{ label: string; href?: string }>;
  onBack: () => void;
  onSave: () => Promise<void> | void;
  tabs?: Tab[];
  /** If no tabs, content goes here */
  children?: ReactNode;
  busy?: boolean;
  saveLabel?: string;
}

export function AdminFormPage({ title, breadcrumb, onBack, onSave, tabs, children, busy, saveLabel = 'Save' }: Props) {
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.id ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try { await onSave(); } finally { setSaving(false); }
  }

  return (
    <>
      {/* Page heading */}
      <div className="row wrapper border-bottom white-bg page-heading">
        <div className="col-sm-8">
          <h2>{title}</h2>
          <ol className="breadcrumb">
            <li><Link href="/admin">Home</Link></li>
            {breadcrumb.map((b, i) => (
              <li key={i} className={i === breadcrumb.length - 1 ? 'active' : ''}>
                {b.href ? <Link href={b.href}>{b.label}</Link> : b.label}
              </li>
            ))}
          </ol>
        </div>
        <div className="col-sm-4" style={{ paddingTop: 20, textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="btn btn-white" onClick={onBack}>
            <i className="fa fa-arrow-left" style={{ marginRight: 4 }} />Back
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || busy}>
            <i className="fa fa-check" style={{ marginRight: 4 }} />{saving ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-content">
                {tabs && tabs.length > 0 ? (
                  <>
                    <ul className="nav nav-tabs">
                      {tabs.map((t) => (
                        <li key={t.id} className={activeTab === t.id ? 'active' : ''}>
                          <a href="#" onClick={e => { e.preventDefault(); setActiveTab(t.id); }}>{t.label}</a>
                        </li>
                      ))}
                    </ul>
                    <div className="tab-content" style={{ paddingTop: 20 }}>
                      {tabs.map((t) => (
                        <div key={t.id} className={`tab-pane ${activeTab === t.id ? 'active' : ''}`}>
                          {t.content}
                        </div>
                      ))}
                    </div>
                  </>
                ) : children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Horizontal form row: label + input */
export function FormRow({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <div className="form-group">
      <label className="col-sm-2 control-label">
        {label}{required && <span className="text-danger"> *</span>}
      </label>
      <div className="col-sm-10">{children}</div>
    </div>
  );
}
