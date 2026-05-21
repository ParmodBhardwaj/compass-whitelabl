'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/auth';
import { resolveImage } from '@/lib/legacy-url';

interface DiEvent {
  id: number;
  title?: string;
  shortDescription?: string;
  description?: string;
  eventType?: string;
  externalLink?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  image?: string;
  isFeatured?: string;
}

interface DiInitiative {
  id: number;
  name?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
}

interface DiFeatured {
  id: number;
  title?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  featuredDate?: string;
}

interface DiNewsletter {
  id: number;
  name?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
}

interface DiVideo {
  id: number;
  name?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
}

type Tab = 'events' | 'initiatives' | 'featured' | 'newsletters' | 'videos';

export default function DniPage() {
  const [events, setEvents] = useState<DiEvent[]>([]);
  const [initiatives, setInitiatives] = useState<DiInitiative[]>([]);
  const [featured, setFeatured] = useState<DiFeatured[]>([]);
  const [newsletters, setNewsletters] = useState<DiNewsletter[]>([]);
  const [videos, setVideos] = useState<DiVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('events');

  useEffect(() => {
    // Single round-trip via /v2/dni/dashboard — fewer requests, fewer
    // partial-load UI states.
    apiFetch<{
      events: DiEvent[]; initiatives: DiInitiative[];
      featured: DiFeatured[]; newsletters: DiNewsletter[]; videos: DiVideo[];
    }>('/dni/dashboard')
      .then(d => {
        setEvents(Array.isArray(d?.events) ? d.events : []);
        setInitiatives(Array.isArray(d?.initiatives) ? d.initiatives : []);
        setFeatured(Array.isArray(d?.featured) ? d.featured : []);
        setNewsletters(Array.isArray(d?.newsletters) ? d.newsletters : []);
        setVideos(Array.isArray(d?.videos) ? d.videos : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs: Array<{ key: Tab; label: string; icon: string; count: number }> = [
    { key: 'events',      label: 'Events',      icon: 'fa-calendar',    count: events.length },
    { key: 'initiatives', label: 'Initiatives',  icon: 'fa-flag',        count: initiatives.length },
    { key: 'featured',    label: 'Featured',     icon: 'fa-star',        count: featured.length },
    { key: 'newsletters', label: 'Newsletters',  icon: 'fa-newspaper-o', count: newsletters.length },
    { key: 'videos',      label: 'Videos',       icon: 'fa-play-circle', count: videos.length },
  ];

  if (loading) {
    return (
      <div className="wrapper wrapper-content animated fadeInRight">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <i className="fa fa-spinner fa-spin" style={{ fontSize: 28, color: '#e2231a' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper wrapper-content animated fadeInRight">
      {/* Header */}
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title">
              <h5>
                <i className="fa fa-users" style={{ marginRight: 8, color: '#3498db' }} />
                D&amp;I — Diversity &amp; Inclusion
              </h5>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-content" style={{ padding: '0 20px' }}>
              <ul style={{
                display: 'flex', listStyle: 'none', padding: 0, margin: 0,
                borderBottom: '2px solid #e5e5e5', flexWrap: 'wrap',
              }}>
                {tabs.map(t => (
                  <li key={t.key}>
                    <button
                      onClick={() => setActiveTab(t.key)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '14px 16px', fontSize: 13, fontWeight: 600,
                        color: activeTab === t.key ? '#e2231a' : '#676a6c',
                        borderBottom: activeTab === t.key ? '2px solid #e2231a' : '2px solid transparent',
                        marginBottom: -2,
                        display: 'flex', alignItems: 'center', gap: 8,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <i className={`fa ${t.icon}`} />
                      {t.label}
                      <span style={{
                        background: activeTab === t.key ? '#e2231a' : '#f4f4f4',
                        color: activeTab === t.key ? '#fff' : '#888',
                        borderRadius: 10, padding: '0 7px', fontSize: 11,
                      }}>
                        {t.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Events */}
      {activeTab === 'events' && (
        <div className="row">
          {events.length === 0 ? (
            <div className="col-lg-12"><EmptyState icon="fa-calendar" text="No events found." /></div>
          ) : (
            events.map(ev => (
              <div className="col-md-6 col-lg-4" key={ev.id}>
                <EventCard event={ev} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Initiatives */}
      {activeTab === 'initiatives' && (
        <div className="row">
          {initiatives.length === 0 ? (
            <div className="col-lg-12"><EmptyState icon="fa-flag" text="No initiatives found." /></div>
          ) : (
            initiatives.map(init => (
              <div className="col-md-4 col-sm-6" key={init.id}>
                <ContentCard title={init.name} description={init.shortDescription} image={init.image} imageFolder="dni" accentColor="#3498db" icon="fa-flag" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Featured */}
      {activeTab === 'featured' && (
        <div className="row">
          {featured.length === 0 ? (
            <div className="col-lg-12"><EmptyState icon="fa-star" text="No featured stories." /></div>
          ) : (
            featured.map(f => (
              <div className="col-md-4 col-sm-6" key={f.id}>
                <ContentCard title={f.title} description={f.shortDescription} image={f.image} imageFolder="dni" accentColor="#f39c12" icon="fa-star" badge={f.featuredDate ?? undefined} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Newsletters */}
      {activeTab === 'newsletters' && (
        <div className="row">
          {newsletters.length === 0 ? (
            <div className="col-lg-12"><EmptyState icon="fa-newspaper-o" text="No newsletters." /></div>
          ) : (
            newsletters.map(n => (
              <div className="col-md-4 col-sm-6" key={n.id}>
                <ContentCard title={n.name} description={n.shortDescription} image={n.image} imageFolder="dni" accentColor="#27ae60" icon="fa-newspaper-o" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Videos */}
      {activeTab === 'videos' && (
        <div className="row">
          {videos.length === 0 ? (
            <div className="col-lg-12"><EmptyState icon="fa-play-circle" text="No videos found." /></div>
          ) : (
            videos.map(v => (
              <div className="col-md-4 col-sm-6" key={v.id}>
                <ContentCard title={v.name} description={v.shortDescription} image={v.image} imageFolder="dni" accentColor="#9b59b6" icon="fa-play-circle" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: DiEvent }) {
  const cover = resolveImage(event.image, 'dni');
  return (
    <div className="ibox float-e-margins" style={{ overflow: 'hidden' }}>
      {cover && (
        <div style={{ height: 160, overflow: 'hidden', background: '#000' }}>
          <img
            src={cover}
            alt={event.title ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="ibox-content" style={{ padding: 16 }}>
        {event.eventType && (
          <span style={{ background: '#3498db22', color: '#3498db', borderRadius: 3, padding: '2px 8px', fontSize: 11, fontWeight: 700, marginBottom: 8, display: 'inline-block' }}>
            {event.eventType}
          </span>
        )}
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, marginTop: 4 }}>{event.title}</div>
        {(event.startDate || event.location) && (
          <div style={{ fontSize: 12, color: '#888', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {event.startDate && <span><i className="fa fa-calendar" style={{ marginRight: 5 }} />{event.startDate}</span>}
            {event.location && <span><i className="fa fa-map-marker" style={{ marginRight: 5 }} />{event.location}</span>}
          </div>
        )}
        {event.shortDescription && (
          <p style={{ fontSize: 12, color: '#666', marginTop: 8, lineHeight: 1.5 }}>
            {event.shortDescription}
          </p>
        )}
        {event.externalLink && (
          <a href={event.externalLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#3498db' }}>
            <i className="fa fa-external-link" style={{ marginRight: 5 }} />Know More
          </a>
        )}
      </div>
    </div>
  );
}

function ContentCard({ title, description, image, imageFolder, accentColor, icon, badge }: {
  title?: string;
  description?: string;
  image?: string;
  imageFolder: string;
  accentColor: string;
  icon: string;
  badge?: string;
}) {
  const cover = resolveImage(image, imageFolder);
  return (
    <div className="ibox float-e-margins" style={{ overflow: 'hidden' }}>
      {cover ? (
        <div style={{ height: 140, overflow: 'hidden', background: '#f4f4f4' }}>
          <img
            src={cover}
            alt={title ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      ) : (
        <div style={{
          height: 100, background: accentColor + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`fa ${icon}`} style={{ fontSize: 36, color: accentColor, opacity: 0.5 }} />
        </div>
      )}
      <div className="ibox-content" style={{ padding: 14 }}>
        {badge && <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{badge}</div>}
        <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
        {description && <p style={{ fontSize: 12, color: '#777', marginTop: 6, lineHeight: 1.5 }}>{description}</p>}
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="ibox float-e-margins">
      <div className="ibox-content" style={{ textAlign: 'center', padding: '50px 0', color: '#aaa' }}>
        <i className={`fa ${icon}`} style={{ fontSize: 36, display: 'block', marginBottom: 14 }} />
        <p style={{ margin: 0, fontSize: 14 }}>{text}</p>
      </div>
    </div>
  );
}
