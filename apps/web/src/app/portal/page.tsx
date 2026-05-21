import { api, Banner, Gallery } from '@/lib/api';
import { MyApplicationsPanel } from '@/components/legacy/MyApplicationsPanel';
import { BannerCarousel } from '@/components/legacy/BannerCarousel';
import { BirthdayCard } from '@/components/legacy/BirthdayCard';
import { GalleryStrip } from '@/components/legacy/GalleryStrip';
import { resolveImage } from '@/lib/legacy-url';

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}

/**
 * Local gallery images served from apps/web/public/Gallery/.
 * Filenames are URL-encoded by GalleryStrip when building the <img src>.
 */
const LOCAL_GALLERY_IMAGES: string[] = [
  '2020-09-07-13-11-58_image003.png',
  '2020-09-07-13-12-01_image001.png',
  '2020-09-07-13-12-01_image002 (1).png',
  '2020-09-07-13-12-01_image002.png',
  '2020-09-07-14-47-36_image008.png',
  '2020-09-07-14-47-36_image013.png',
  '2020-09-07-14-47-37_image001 (1).png',
  '2020-09-07-14-47-37_image014.png',
];

/**
 * Local banner-link images served from apps/web/public/baner-link-section/.
 * Two equal-width banners rendered below the gallery section.
 */
const BANNER_LINK_SECTION: Array<{ src: string; href: string; alt: string }> = [
  {
    src: '/baner-link-section/26356da09ee7d14ecc4c0cc0433444bd.jpg',
    href: '#',
    alt: 'Banner 1',
  },
  {
    src: '/baner-link-section/ec439dbcb758e1c01f68804874d74d0f.jpg',
    href: '#',
    alt: 'Banner 2',
  },
];

// Static hero banners (Azure Blob Storage) — used as carousel
const STATIC_BANNERS: Banner[] = [
  {
    id: 1,
    image: 'https://hmclsahcompassci01t.blob.core.windows.net/herocompass-prod/assets/banner/33ec23c37f03fc32d34c050db5b74335.jpg?sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-12-31T16:36:24Z&st=2025-05-29T08:36:24Z&spr=https,http&sig=onnhhVdUPcaTTX8bpptnkrD%2FANXH%2FMO7%2BWyTZAYaJzg%3D',
    url: '#',
  },
  {
    id: 2,
    image: 'https://hmclsahcompassci01t.blob.core.windows.net/herocompass-prod/assets/banner/3888f6fc0b417376450c69d41f1a2500.jpg?sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-12-31T16:36:24Z&st=2025-05-29T08:36:24Z&spr=https,http&sig=onnhhVdUPcaTTX8bpptnkrD%2FANXH%2FMO7%2BWyTZAYaJzg%3D',
    url: '#',
  },
];

export default async function PortalHome() {
  const [galleries, promoBanners] = await Promise.all([
    safe(api<Gallery[]>('/galleries?store=1&covers=1'), []),
    safe(api<Array<{ id: number; image?: string; url?: string }>>('/banners/home'), []),
  ]);

  const carouselBanners = STATIC_BANNERS;

  return (
    <div className="wrapper wrapper-content animated fadeInRight">

      {/* ═══════════════════════════════════════════════════════════════════
          ROW 1 — Banner Carousel + MY APPLICATIONS panel (equal-height flex)
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="row"
        style={{ marginTop: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}
      >
        <div
          className="col-lg-9"
          style={{ paddingRight: 8, display: 'flex', flexDirection: 'column' }}
        >
          <BannerCarousel banners={carouselBanners} />
        </div>

        <div className="col-lg-3" style={{ display: 'flex', flexDirection: 'column' }}>
          <MyApplicationsPanel />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ROW 2 — Birthday card + Photo Gallery (equal heights via flex)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="row equal-height-row" style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap' }}>
        <div className="col-md-5 col-lg-4" style={{ display: 'flex', flexDirection: 'column' }}>
          <BirthdayCard />
        </div>
        <div className="col-md-7 col-lg-8" style={{ display: 'flex', flexDirection: 'column' }}>
          <GalleryStrip galleries={galleries} localImages={LOCAL_GALLERY_IMAGES} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ROW 3 — Two equal-size banner-link images (local, /public/baner-link-section)
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="row"
        style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}
      >
        {BANNER_LINK_SECTION.map((b, i) => (
          <div
            key={i}
            className="col-md-6"
            style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}
          >
            <a
              href={b.href}
              style={{
                display: 'block',
                width: '100%',
                flex: '1 1 auto',
                borderRadius: 4,
                overflow: 'hidden',
                background: '#000',
              }}
            >
              <img
                src={b.src}
                alt={b.alt}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'cover',
                  aspectRatio: '16 / 6',
                }}
              />
            </a>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ROW 4 — Promo banners from API (2 side-by-side)
          ═══════════════════════════════════════════════════════════════════ */}
      {promoBanners.length > 0 && (
        <div className="row" style={{ marginTop: 16 }}>
          {promoBanners.map((b) => {
            const src = resolveImage(b.image, 'banners');
            return (
              <div key={b.id} className="col-md-6">
                <a href={b.url ?? '#'}>
                  {src
                    ? (
                      <img
                        src={src}
                        alt=""
                        style={{ width: '100%', borderRadius: 4, display: 'block' }}
                      />
                    )
                    : (
                      <div style={{
                        width: '100%', height: 100, borderRadius: 4,
                        background: '#e7eaec', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#bbb',
                      }}>
                        Banner
                      </div>
                    )}
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
