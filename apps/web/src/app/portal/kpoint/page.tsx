'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/auth';
import { resolveImage } from '@/lib/legacy-url';

interface DashboardItem {
  id: number;
  title?: string;
  image?: string;
  imageLink?: string;
  videoType?: string;
  dealerVisible?: string;
  status?: string;
}

interface LinkNode {
  id: number;
  title?: string;
  alias?: string;
  section?: string;
  ordering?: number;
  mappingId?: number;
  children?: LinkNode[];
}

interface Video {
  id: number;
  videoLinkId?: number;
  type?: string;
  language?: string;
  videoLink?: string;
}

interface Disclaimer {
  id: number;
  title?: string;
  description?: string;
}

export default function KpointPage() {
  const [dashboard, setDashboard] = useState<DashboardItem[]>([]);
  const [linkTree, setLinkTree] = useState<LinkNode[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [disclaimer, setDisclaimer] = useState<Disclaimer | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [activeLink, setActiveLink] = useState<LinkNode | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<DashboardItem[]>('/kpoint/dashboard').catch(() => []),
      apiFetch<LinkNode[]>('/kpoint/links/tree').catch(() => []),
      apiFetch<Video[]>('/kpoint/videos').catch(() => []),
      apiFetch<Disclaimer | null>('/kpoint/disclaimer').catch(() => null),
    ]).then(([d, t, v, disc]) => {
      setDashboard(Array.isArray(d) ? d : []);
      setLinkTree(Array.isArray(t) ? t : []);
      setVideos(Array.isArray(v) ? v : []);
      setDisclaimer(disc);
      setLoading(false);
    });
  }, []);

  // Filtered videos
  const filteredVideos = videos.filter(v => {
    if (typeFilter && v.type !== typeFilter) return false;
    if (langFilter && v.language !== langFilter) return false;
    if (activeLink && v.videoLinkId !== activeLink.id) return false;
    return true;
  });

  const types = [...new Set(videos.map(v => v.type).filter(Boolean))] as string[];
  const languages = [...new Set(videos.map(v => v.language).filter(Boolean))] as string[];

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
      {/* Page heading */}
      <div className="row">
        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-title">
              <h5>
                <i className="fa fa-play-circle" style={{ marginRight: 8, color: '#e2231a' }} />
                kPoint — Video Learning Portal
              </h5>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard tiles */}
      {dashboard.length > 0 && (
        <div className="row" style={{ marginBottom: 20 }}>
          {dashboard.map(item => (
            <div className="col-md-3 col-sm-6" key={item.id}>
              <a
                href={item.imageLink ?? '#'}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div className="ibox float-e-margins" style={{ overflow: 'hidden' }}>
                  <div style={{ position: 'relative', background: '#000', height: 160, overflow: 'hidden' }}>
                    <img
                      src={resolveImage(item.image, 'kpoint') ?? '/img/placeholder.png'}
                      alt={item.title ?? ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    {/* Play overlay */}
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className="fa fa-play-circle" style={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                    </div>
                    {item.videoType && (
                      <span style={{
                        position: 'absolute', top: 8, right: 8,
                        background: '#e2231a', color: '#fff',
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 3,
                        textTransform: 'uppercase',
                      }}>
                        {item.videoType}
                      </span>
                    )}
                  </div>
                  <div className="ibox-content" style={{ padding: '10px 14px' }}>
                    <strong style={{ fontSize: 13, color: '#333' }}>{item.title ?? 'Video'}</strong>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="row">
        {/* Left: Link tree */}
        {linkTree.length > 0 && (
          <div className="col-md-3">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5><i className="fa fa-list" style={{ marginRight: 8 }} />Categories</h5>
              </div>
              <div className="ibox-content" style={{ padding: 0 }}>
                <ul className="list-group" style={{ marginBottom: 0 }}>
                  <li
                    className={`list-group-item${!activeLink ? ' active' : ''}`}
                    style={{ cursor: 'pointer', fontSize: 13 }}
                    onClick={() => setActiveLink(null)}
                  >
                    <i className="fa fa-play" style={{ marginRight: 8 }} />
                    All Videos
                    <span className="badge" style={{ float: 'right' }}>{videos.length}</span>
                  </li>
                  {linkTree.map(link => (
                    <LinkItem
                      key={link.id}
                      node={link}
                      activeId={activeLink?.id}
                      onSelect={setActiveLink}
                      videos={videos}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Right: Video grid + filters */}
        <div className={linkTree.length > 0 ? 'col-md-9' : 'col-md-12'}>
          {/* Filters */}
          <div className="ibox float-e-margins">
            <div className="ibox-content">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '0 0 auto' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, marginRight: 8 }}>Type:</label>
                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    style={{ padding: '4px 10px', borderRadius: 3, border: '1px solid #ccc', fontSize: 13 }}
                  >
                    <option value="">All</option>
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ flex: '0 0 auto' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, marginRight: 8 }}>Language:</label>
                  <select
                    value={langFilter}
                    onChange={e => setLangFilter(e.target.value)}
                    style={{ padding: '4px 10px', borderRadius: 3, border: '1px solid #ccc', fontSize: 13 }}
                  >
                    <option value="">All</option>
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>
                  {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Video grid */}
          {filteredVideos.length === 0 ? (
            <div className="ibox float-e-margins">
              <div className="ibox-content" style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                <i className="fa fa-film" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
                No videos found for the selected filters.
              </div>
            </div>
          ) : (
            <div className="row">
              {filteredVideos.map(v => (
                <div className="col-md-4 col-sm-6" key={v.id}>
                  <VideoCard video={v} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      {disclaimer && (
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox float-e-margins">
              <div className="ibox-title">
                <h5><i className="fa fa-info-circle" style={{ marginRight: 8 }} />{disclaimer.title ?? 'Disclaimer'}</h5>
              </div>
              <div
                className="ibox-content"
                style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: disclaimer.description ?? '' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LinkItem({
  node, activeId, onSelect, videos, depth = 0,
}: {
  node: LinkNode;
  activeId?: number;
  onSelect: (n: LinkNode) => void;
  videos: Video[];
  depth?: number;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const active = activeId === node.id;
  const videoCount = videos.filter(v => v.videoLinkId === node.id).length;
  return (
    <>
      <li
        className={`list-group-item${active ? ' active' : ''}`}
        style={{ cursor: 'pointer', fontSize: 13, paddingLeft: 16 + depth * 16 }}
        onClick={() => hasChildren ? setOpen(o => !o) : onSelect(node)}
      >
        <i
          className={`fa ${hasChildren ? (open ? 'fa-folder-open' : 'fa-folder') : 'fa-play'}`}
          style={{ marginRight: 8 }}
        />
        {node.title}
        {!hasChildren && videoCount > 0 && (
          <span className="badge" style={{ float: 'right', background: active ? '#fff' : '#e2231a', color: active ? '#e2231a' : '#fff' }}>
            {videoCount}
          </span>
        )}
        {hasChildren && <i className={`fa fa-chevron-${open ? 'down' : 'right'}`} style={{ float: 'right', fontSize: 11, marginTop: 2 }} />}
      </li>
      {hasChildren && open && node.children!.map(c => (
        <LinkItem key={c.id} node={c} activeId={activeId} onSelect={onSelect} videos={videos} depth={depth + 1} />
      ))}
    </>
  );
}

function VideoCard({ video }: { video: Video }) {
  // Extract kPoint embed ID from the URL if available
  const kpointId = video.videoLink?.match(/kpoint\.in\/[^/]+\/([^/?]+)/)?.[1] ?? null;
  const embedUrl = kpointId
    ? `https://www.kpoint.in/embed/${kpointId}`
    : video.videoLink ?? null;

  return (
    <div className="ibox float-e-margins" style={{ overflow: 'hidden' }}>
      <div style={{ background: '#1a1a1a', position: 'relative', paddingBottom: '56.25%', overflow: 'hidden' }}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#555',
          }}>
            <i className="fa fa-video-camera" style={{ fontSize: 32 }} />
          </div>
        )}
      </div>
      <div className="ibox-content" style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {video.type && (
            <span style={{ background: '#e2231a', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 3, fontWeight: 700 }}>
              {video.type}
            </span>
          )}
          {video.language && (
            <span style={{ background: '#f4f4f4', color: '#555', fontSize: 10, padding: '1px 6px', borderRadius: 3 }}>
              {video.language}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
