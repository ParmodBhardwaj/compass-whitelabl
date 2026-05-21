'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/auth';
import { resolveImage } from '@/lib/legacy-url';

interface Message {
  id: number;
  title?: string;
  description?: string;
  image?: string;
}

export default function CeoMessagePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<Message[]>('/ceo-message')
      .then(d => {
        const msgs = Array.isArray(d) ? d : [];
        setMessages(msgs);
        if (msgs.length > 0) setActiveId(msgs[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const active = messages.find(m => m.id === activeId);

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <i className="fa fa-spinner fa-spin" style={{ fontSize: 28, color: '#e2231a' }} />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-content" style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
                <i className="fa fa-microphone" style={{ fontSize: 36, display: 'block', marginBottom: 14 }} />
                <p style={{ margin: 0, fontSize: 14 }}>No messages available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      <div className="row">
        {/* Left: message list */}
        {messages.length > 1 && (
          <div className="col-md-3">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5><i className="fa fa-list" style={{ marginRight: 8 }} />All Messages</h5>
              </div>
              <div className="ibox-content" style={{ padding: 0 }}>
                {messages.map(m => (
                  <div
                    key={m.id}
                    onClick={() => setActiveId(m.id)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f4f4f4',
                      background: activeId === m.id ? '#fff5f5' : 'transparent',
                      borderLeft: activeId === m.id ? '3px solid #e2231a' : '3px solid transparent',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: activeId === m.id ? '#e2231a' : '#555' }}>
                      {m.title ?? 'Message ' + m.id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right: active message */}
        <div className={messages.length > 1 ? 'col-md-9' : 'col-md-12'}>
          {active && (
            <div className="ibox float-e-margins">
              {active.image && (
                <div style={{ overflow: 'hidden', maxHeight: 380, background: '#000' }}>
                  <img
                    src={resolveImage(active.image, 'ceo') ?? ''}
                    alt={active.title ?? ''}
                    style={{ width: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="ibox-title">
                <h5>
                  <i className="fa fa-microphone" style={{ marginRight: 8, color: '#e2231a' }} />
                  {active.title}
                </h5>
              </div>
              <div
                className="ibox-content"
                style={{ fontSize: 14, lineHeight: 1.8, color: '#555' }}
                dangerouslySetInnerHTML={{ __html: active.description ?? '' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
