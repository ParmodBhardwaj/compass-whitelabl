'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Gallery } from '@/lib/api';
import { resolveImage } from '@/lib/legacy-url';

const PAGE_SIZE = 4;

/** Lightweight tile model — covers both DB galleries and local image files. */
interface Tile {
  key: string;
  src: string;
  title?: string;
  href: string;
}

/**
 * Build tiles for local files served from `/public/Gallery`.
 * Filenames may include spaces/parentheses, so encode each path segment.
 */
function tilesFromLocal(localImages: string[]): Tile[] {
  return localImages.map((filename, i) => ({
    key: `local-${i}-${filename}`,
    src: `/Gallery/${encodeURIComponent(filename)}`,
    title: undefined,
    href: '/portal/galleries',
  }));
}

function tilesFromGalleries(galleries: Gallery[]): Tile[] {
  return galleries.map((g) => ({
    key: `gallery-${g.id}`,
    src: resolveImage(g.coverImage, 'images') ?? '',
    title: g.title,
    href: g.alias ? `/portal/galleries/${g.alias}` : '#',
  }));
}

interface Props {
  /** DB-backed galleries from the API. Used when `localImages` is not provided. */
  galleries: Gallery[];
  /**
   * Optional list of filenames under `apps/web/public/Gallery/` to show instead
   * of API galleries. When set, the strip renders these images directly.
   */
  localImages?: string[];
}

export function GalleryStrip({ galleries, localImages }: Props) {
  const tiles = localImages && localImages.length > 0
    ? tilesFromLocal(localImages)
    : tilesFromGalleries(galleries);

  const pages = Math.max(1, Math.ceil(tiles.length / PAGE_SIZE));
  const [page, setPage] = useState(0);
  const slice = tiles.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  // pad to 4 if fewer
  const items: (Tile | null)[] = [...slice, ...Array(Math.max(0, PAGE_SIZE - slice.length)).fill(null)];

  return (
    <div
      className="ibox-content"
      style={{
        padding: '14px 16px',
        borderRadius: 4,
        background: '#fff',
        // Match parent flex-column so thumbnails grow to fill BirthdayCard height
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 280,
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 10,
        flexShrink: 0,
      }}>
        <strong style={{ fontSize: 13, letterSpacing: 0.5 }}>PHOTO GALLERY</strong>
        <Link href="/portal/galleries" style={{ color: '#1c84c6', fontSize: 12 }}>
          View all →
        </Link>
      </div>

      {/* Thumbnails grid — grows to fill available vertical space */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 6,
          flex: '1 1 auto',
          minHeight: 0,
        }}
      >
        {items.map((tile, i) => (
          <Link
            key={tile?.key ?? `empty-${i}`}
            href={tile?.href ?? '#'}
            style={{
              // Fill the grid cell height instead of forcing 1:1
              display: 'block',
              width: '100%',
              height: '100%',
              minHeight: 100,
              borderRadius: 4,
              overflow: 'hidden',
              background: '#e7eaec',
              position: 'relative',
            }}
          >
            {tile?.src ? (
              <img
                src={tile.src}
                alt={tile.title ?? ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fa fa-picture-o" style={{ color: '#bbb', fontSize: 20 }} />
              </div>
            )}
            {tile?.title && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.45)', color: '#fff',
                fontSize: 10, padding: '3px 6px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {tile.title}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Pagination dots */}
      {pages > 1 && (
        <div style={{ textAlign: 'center', marginTop: 10, flexShrink: 0 }}>
          {Array.from({ length: pages }).map((_, i) => (
            <span
              key={i}
              onClick={() => setPage(i)}
              style={{
                display: 'inline-block',
                width: i === page ? 18 : 10,
                height: 10,
                borderRadius: 5,
                margin: '0 3px',
                background: i === page ? '#e2231a' : '#c4c9ce',
                cursor: 'pointer',
                transition: 'width 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
