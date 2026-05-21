import { Injectable } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  HeroCmsPages,
  News,
  HeroGallery,
  Menu,
  Activity,
  HeroPolicy,
  Employee,
} from '@hero/db/src/models/generated';

export type SearchHit = {
  kind: 'page' | 'news' | 'gallery' | 'menu' | 'activity' | 'policy' | 'employee';
  id: number;
  title?: string;
  url?: string;
  snippet?: string;
  image?: string;
};

/**
 * Quick-search response used by the header's typeahead dropdown — matches
 * the legacy two-column layout (Employee List | Application Links).
 */
export interface QuickSearchResult {
  employees: Array<{
    id: number;
    name: string;
    email?: string;
    ecode?: string;
    designation?: string;
    profilepic?: string;
  }>;
  applications: Array<{
    id: number;
    title: string;
    url: string;
    icon?: string;
    kind: 'menu' | 'page' | 'news' | 'gallery' | 'activity' | 'policy';
  }>;
}

@Injectable()
export class SearchService {
  // ── Legacy flat-list endpoint, kept for /portal/search?q=… page ──
  async search(q: string, limit = 10): Promise<SearchHit[]> {
    if (!q || q.length < 2) return [];
    const like = { [Op.like]: `%${q}%` };
    const [pages, news, galleries, menus, activities, policies, employees] = await Promise.all([
      HeroCmsPages.findAll({ where: { title: like, status: '1' } as any, limit, raw: true }),
      News.findAll({ where: { title: like, status: '1' } as any, limit, raw: true }),
      HeroGallery.findAll({ where: { title: like, status: '1' } as any, limit, raw: true }),
      Menu.findAll({ where: { menuName: like, active: '1' } as any, limit, raw: true }),
      Activity.findAll({ where: { title: like, status: '1' } as any, limit, raw: true }),
      HeroPolicy.findAll({ where: { title: like, status: '1' } as any, limit, raw: true }),
      this.findEmployees(q, limit),
    ]);
    const hits: SearchHit[] = [];
    for (const r of pages as any[])
      hits.push({ kind: 'page', id: r.id, title: r.title, url: `/portal/cms/${r.alias}`, snippet: r.short_description });
    for (const r of news as any[])
      hits.push({ kind: 'news', id: r.id, title: r.title, url: `/portal/news/${r.alias}`, snippet: r.short_description });
    for (const r of galleries as any[])
      hits.push({ kind: 'gallery', id: r.id, title: r.title, url: `/portal/galleries/${r.alias}` });
    for (const r of menus as any[])
      hits.push({ kind: 'menu', id: r.id, title: r.menu_name, url: r.url });
    for (const r of activities as any[])
      hits.push({ kind: 'activity', id: r.id, title: r.title, url: `/portal/activities/${r.alias}`, snippet: r.short_description });
    for (const r of policies as any[])
      hits.push({ kind: 'policy', id: r.id, title: r.title, url: `/portal/policies/${r.id}`, snippet: r.short_description });
    for (const e of employees)
      hits.push({ kind: 'employee', id: e.id, title: e.name, url: `mailto:${e.email}`, snippet: e.designation, image: e.profilepic });
    return hits;
  }

  /**
   * Typeahead — returns the data shape the header dropdown wants.
   * Legacy parity: two columns, Employee List (with photo+email) on the
   * left and Application Links (matching menus + pages + news + activities)
   * on the right.
   */
  async quick(q: string, limit = 8): Promise<QuickSearchResult> {
    if (!q || q.length < 2) return { employees: [], applications: [] };
    const like = { [Op.like]: `%${q}%` };
    const [menus, employees, pages, news, activities] = await Promise.all([
      Menu.findAll({ where: { menuName: like, active: '1' } as any, limit, raw: true }),
      this.findEmployees(q, limit),
      HeroCmsPages.findAll({ where: { title: like, status: '1' } as any, limit: 4, raw: true }),
      News.findAll({ where: { title: like, status: '1' } as any, limit: 4, raw: true }),
      Activity.findAll({ where: { title: like, status: '1' } as any, limit: 4, raw: true }),
    ]);

    const applications: QuickSearchResult['applications'] = [];
    for (const m of menus as any[])
      applications.push({
        id: m.id, title: m.menu_name,
        url: m.url ?? '#', icon: m.class, kind: 'menu',
      });
    for (const p of pages as any[])
      applications.push({
        id: p.id, title: p.title, url: `/portal/cms/${p.alias}`, kind: 'page',
      });
    for (const n of news as any[])
      applications.push({
        id: n.id, title: n.title, url: `/portal/news/${n.alias}`, kind: 'news',
      });
    for (const a of activities as any[])
      applications.push({
        id: a.id, title: a.title, url: `/portal/activities/${a.alias}`, kind: 'activity',
      });

    return { employees, applications };
  }

  /** Employee search — name / ecode / email / displayName LIKE q. */
  private async findEmployees(q: string, limit: number) {
    const like = { [Op.like]: `%${q}%` };
    const rows = (await Employee.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { name: like },
              { ecode: like },
              { email: like },
              { displayName: like } as any,
            ],
          },
          { state: { [Op.ne]: '0' } } as any,
        ],
      } as any,
      attributes: ['userId', 'name', 'displayName', 'email', 'ecode', 'designation', 'profilepic'],
      limit,
      raw: true,
    })) as any[];
    return rows.map((r) => ({
      id: r.userId,
      name: r.name ?? r.displayName ?? '—',
      email: r.email,
      ecode: r.ecode,
      designation: r.designation,
      profilepic: r.profilepic,
    }));
  }
}
