/**
 * Seed sample portal content so the homepage renders end-to-end without the
 * real Hero data dump.
 *
 * Tables touched: home_banners, hero_banners, news, hero_gallery,
 * hero_gallery_category, hero_gallery_images, hero_cms_pages.
 *
 * Idempotent — uses upsert keyed on stable IDs (1..N).
 *
 * Run: pnpm --filter @hero/db seed
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
loadEnv({ path: resolve(__dirname, '../../../.env') });
import { initDb } from '../src';
import {
  HomeBanners,
  HeroBanners,
  News,
  HeroGallery,
  HeroGalleryCategory,
  HeroGalleryImages,
  HeroCmsPages,
} from '../src/models/generated';

const PLACEHOLDER = 'https://placehold.co/1600x500/0a3d62/ffffff?text=';
const THUMB = 'https://placehold.co/600x400/2c3e50/ecf0f1?text=';

async function seed() {
  const cfg = {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME ?? 'heronewlanding',
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
  };
  console.log(`Connecting to mysql://${cfg.username}@${cfg.host}:${cfg.port}/${cfg.database} ...`);
  const sequelize = initDb(cfg);
  await sequelize.authenticate();
  console.log('Connected.');

  // ---- Home banners (top hero carousel) ----
  for (const b of [
    { id: 1, image: `${PLACEHOLDER}Welcome+to+Hero+Compass`, url: '/portal' },
    { id: 2, image: `${PLACEHOLDER}Operational+Excellence`, url: '/portal/sop' },
    { id: 3, image: `${PLACEHOLDER}Audit+%26+Compliance`, url: '/portal/audit' },
  ]) {
    await HomeBanners.upsert(b as any);
  }
  console.log('home_banners: 3 rows');

  // ---- Hero banners (module banners, store=1) ----
  for (const b of [
    { id: 1, title: 'IS Portal', content: 'Information Security', image: `${THUMB}IS+Portal`, url: '/portal/is', sortOrder: 1, isActive: '1', store: 1 },
    { id: 2, title: 'Idea Box', content: 'Submit your ideas', image: `${THUMB}Idea+Box`, url: '/portal/idea', sortOrder: 2, isActive: '1', store: 1 },
  ]) {
    await HeroBanners.upsert(b as any);
  }
  console.log('hero_banners: 2 rows');

  // ---- News ----
  const today = new Date().toISOString().slice(0, 10);
  for (const n of [
    { id: 1, title: 'Hero launches new portal', alias: 'hero-launches-new-portal', newsType: '1', externalLink: '', shortDescription: 'A modern Node + Next.js stack replaces the legacy PHP portal.', description: 'Full story...', newsDate: today, image: `${THUMB}News+1`, isFeatured: '1', store: 1, status: '1' },
    { id: 2, title: 'Q1 results', alias: 'q1-results', newsType: '1', externalLink: '', shortDescription: 'Strong performance across business units.', description: 'Full story...', newsDate: today, image: `${THUMB}News+2`, isFeatured: '0', store: 1, status: '1' },
    { id: 3, title: 'Safety week 2026', alias: 'safety-week-2026', newsType: '1', externalLink: '', shortDescription: 'Plant-wide safety drills and training.', description: 'Full story...', newsDate: today, image: `${THUMB}News+3`, isFeatured: '0', store: 1, status: '1' },
  ]) {
    await News.upsert(n as any);
  }
  console.log('news: 3 rows');

  // ---- Gallery categories ----
  for (const c of [
    { id: 1, name: 'Events', alias: 'events', sortorder: 1 },
    { id: 2, name: 'Plant Tours', alias: 'plant-tours', sortorder: 2 },
  ]) {
    await HeroGalleryCategory.upsert(c as any);
  }
  console.log('hero_gallery_category: 2 rows');

  // ---- Galleries ----
  for (const g of [
    { id: 1, title: 'Annual Day 2026', alias: 'annual-day-2026', category: 1, thumbWidth: '300', thumbHeight: '200', sortorder: 1, createdAt: today, store: 1, status: '1' },
    { id: 2, title: 'Plant Visit – March', alias: 'plant-visit-march', category: 2, thumbWidth: '300', thumbHeight: '200', sortorder: 2, createdAt: today, store: 1, status: '1' },
  ]) {
    await HeroGallery.upsert(g as any);
  }
  console.log('hero_gallery: 2 rows');

  // ---- Gallery images ----
  let imgId = 1;
  for (const galleryId of [1, 2]) {
    for (let i = 1; i <= 3; i++) {
      await HeroGalleryImages.upsert({
        id: imgId++,
        title: `Image ${i}`,
        galleryId,
        image: `${THUMB}G${galleryId}+I${i}`,
        thumbnail: `${THUMB}G${galleryId}+I${i}`,
        createdAt: today,
        isFeatured: i === 1 ? '1' : '0',
      } as any);
    }
  }
  console.log(`hero_gallery_images: ${imgId - 1} rows`);

  // ---- CMS landing page ----
  await HeroCmsPages.upsert({
    id: 1,
    title: 'Welcome to Hero Compass',
    alias: 'home',
    description: '<h2>Welcome</h2><p>This is the Hero Compass portal.</p>',
    store: 1,
    status: '1',
  } as any).catch((e) => console.warn('hero_cms_pages upsert skipped:', e.message));

  console.log('\nSeed complete.');
  await sequelize.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
