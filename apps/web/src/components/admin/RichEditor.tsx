'use client';
import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

/** Simple rich-text toolbar over a contenteditable div */
export function RichEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isUserEdit = useRef(false);

  useEffect(() => {
    if (ref.current && !isUserEdit.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value ?? '';
    }
  }, [value]);

  function exec(cmd: string, val?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
  }

  const tools: Array<{ icon: string; cmd: string; val?: string; title: string }> = [
    { icon: 'bold', cmd: 'bold', title: 'Bold' },
    { icon: 'italic', cmd: 'italic', title: 'Italic' },
    { icon: 'underline', cmd: 'underline', title: 'Underline' },
    { icon: 'list-ul', cmd: 'insertUnorderedList', title: 'Bullet list' },
    { icon: 'list-ol', cmd: 'insertOrderedList', title: 'Numbered list' },
    { icon: 'align-left', cmd: 'justifyLeft', title: 'Align left' },
    { icon: 'align-center', cmd: 'justifyCenter', title: 'Align center' },
    { icon: 'align-right', cmd: 'justifyRight', title: 'Align right' },
  ];

  return (
    <div style={{ border: '1px solid #e5e6e7', borderRadius: 4 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 2, padding: '6px 8px', borderBottom: '1px solid #e5e6e7', background: '#fafafa', flexWrap: 'wrap' }}>
        {tools.map(t => (
          <button
            key={t.cmd} type="button" title={t.title}
            onMouseDown={e => { e.preventDefault(); exec(t.cmd, t.val); }}
            style={{ padding: '3px 7px', border: '1px solid #ddd', borderRadius: 3, background: 'white', cursor: 'pointer' }}
          >
            <i className={`fa fa-${t.icon}`} />
          </button>
        ))}
        <button type="button" title="Link"
          onMouseDown={e => {
            e.preventDefault();
            const url = prompt('URL:');
            if (url) exec('createLink', url);
          }}
          style={{ padding: '3px 7px', border: '1px solid #ddd', borderRadius: 3, background: 'white', cursor: 'pointer' }}
        >
          <i className="fa fa-link" />
        </button>
        <button type="button" title="Remove link"
          onMouseDown={e => { e.preventDefault(); exec('unlink'); }}
          style={{ padding: '3px 7px', border: '1px solid #ddd', borderRadius: 3, background: 'white', cursor: 'pointer' }}
        >
          <i className="fa fa-unlink" />
        </button>
        <button type="button" title="Source (HTML)"
          onMouseDown={e => {
            e.preventDefault();
            const html = ref.current?.innerHTML ?? '';
            const edited = prompt('Edit HTML:', html);
            if (edited !== null && ref.current) {
              ref.current.innerHTML = edited;
              onChange(edited);
            }
          }}
          style={{ padding: '3px 7px', border: '1px solid #ddd', borderRadius: 3, background: 'white', cursor: 'pointer' }}
        >
          <i className="fa fa-code" />
        </button>
      </div>
      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          isUserEdit.current = true;
          onChange(ref.current?.innerHTML ?? '');
          setTimeout(() => { isUserEdit.current = false; }, 0);
        }}
        style={{ minHeight: 200, padding: 12, outline: 'none', fontSize: 14, lineHeight: 1.6 }}
      />
    </div>
  );
}
