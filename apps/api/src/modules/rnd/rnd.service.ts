import { Injectable, NotFoundException } from '@nestjs/common';
import { Op, QueryTypes, getDb } from '@hero/db';
import {
  HeroRndNoticeBoard,
  HeroRndJoinees,
  HeroRndCompetitorProduct,
  Message,
  News,
} from '@hero/db/src/models/generated';

/**
 * R&D Portal — Wave 3 module.
 *
 * Hero's Research & Development information portal. Shows:
 *   • Notice board announcements
 *   • R&D team joinees (new joiners) with profile photos
 *   • Competitor product comparison table
 *
 * Tables:
 *   hero_rnd_notice_board       — notice/announcement text blocks
 *   hero_rnd_joinees            — new R&D team members with image + designation
 *   hero_rnd_competitor_product — competitor product listing (name, price, desc, image)
 */
@Injectable()
export class RndService {
  // ── Notice Board ─────────────────────────────────────────────────────────

  async getNotices() {
    return HeroRndNoticeBoard.findAll({
      where: { status: '1' } as any,
      order: [['id', 'DESC']],
    });
  }

  async createNotice(dto: { description: string; status?: string }) {
    return HeroRndNoticeBoard.create({
      description: dto.description,
      status: dto.status ?? '1',
    } as any);
  }

  async updateNotice(id: number, dto: Partial<{ description: string; status: string }>) {
    const row = await HeroRndNoticeBoard.findByPk(id);
    if (!row) throw new NotFoundException('Notice not found');
    await row.update(dto as any);
    return row;
  }

  async deleteNotice(id: number) {
    const row = await HeroRndNoticeBoard.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Joinees ──────────────────────────────────────────────────────────────

  async getJoinees(storeId = 1) {
    return HeroRndJoinees.findAll({
      where: { status: '1', storeId } as any,
      order: [['id', 'DESC']],
    });
  }

  async createJoinee(dto: {
    name: string;
    designation?: string;
    description?: string;
    image?: string;
    status?: string;
    storeId?: number;
    type?: string;
  }) {
    return HeroRndJoinees.create({
      name: dto.name,
      designation: dto.designation ?? null,
      description: dto.description ?? null,
      image: dto.image ?? null,
      status: dto.status ?? '1',
      storeId: dto.storeId ?? 1,
      type: dto.type ?? null,
    } as any);
  }

  async updateJoinee(id: number, dto: Partial<{
    name: string;
    designation: string;
    description: string;
    image: string;
    status: string;
    storeId: number;
    type: string;
  }>) {
    const row = await HeroRndJoinees.findByPk(id);
    if (!row) throw new NotFoundException('Joinee not found');
    await row.update(dto as any);
    return row;
  }

  async deleteJoinee(id: number) {
    const row = await HeroRndJoinees.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Competitor Products ───────────────────────────────────────────────────

  async getCompetitorProducts() {
    return HeroRndCompetitorProduct.findAll({
      where: { status: '1' } as any,
      order: [['id', 'ASC']],
    });
  }

  async createCompetitorProduct(dto: {
    name: string;
    price?: number;
    description?: string;
    image?: string;
    status?: string;
  }) {
    return HeroRndCompetitorProduct.create({
      name: dto.name,
      price: dto.price ?? null,
      description: dto.description ?? null,
      image: dto.image ?? null,
      status: dto.status ?? '1',
    } as any);
  }

  async updateCompetitorProduct(id: number, dto: Partial<{
    name: string;
    price: number;
    description: string;
    image: string;
    status: string;
  }>) {
    const row = await HeroRndCompetitorProduct.findByPk(id);
    if (!row) throw new NotFoundException('Product not found');
    await row.update(dto as any);
    return row;
  }

  async deleteCompetitorProduct(id: number) {
    const row = await HeroRndCompetitorProduct.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.destroy();
    return { id, deleted: true };
  }

  // ── CEO Message + Overview (stored as `message` rows id=2 and id=3) ───────
  //
  // Legacy `Tcg\Controller\SettingController` and `RnD\Controller\SettingController`
  // both edit two fixed rows in the `message` table:
  //   id=2 → CEO/Message of the month (shown on RnD + TCG landing)
  //   id=3 → Overview (long-form description)
  // The model is named `Message` in our generated schema (table `message`).

  /** CEO/Message-of-the-month payload (legacy `CEOMessage\Entity\CEOMessage` id=2). */
  async getCeoMessage() {
    return Message.findByPk(2);
  }

  /** Long-form overview block (legacy `CEOMessage\Entity\CEOMessage` id=3). */
  async getOverview() {
    return Message.findByPk(3);
  }

  async updateCeoMessage(dto: Partial<{ title: string; description: string; image: string }>) {
    const row = await Message.findByPk(2);
    if (!row) throw new NotFoundException('CEO Message row (id=2) not found');
    await row.update(dto as any);
    return row;
  }

  async updateOverview(dto: Partial<{ title: string; description: string; image: string }>) {
    const row = await Message.findByPk(3);
    if (!row) throw new NotFoundException('Overview row (id=3) not found');
    await row.update(dto as any);
    return row;
  }

  // ── Landing aggregator ───────────────────────────────────────────────────
  //
  // Legacy `RnD\Controller\HomeController::indexAction` combined gallery,
  // news, joinees, competitor products, birthdays, CEO message, overview and
  // notice into a single payload for the landing page. We provide the same
  // shape so the new /portal/rnd page can do one round-trip.

  /**
   * R&D / TCG landing dashboard. `storeId` selects which portal's data set
   * to surface (legacy R&D uses storeId=6, TCG also uses storeId=6).
   * Filters joinees, news, and gallery by storeId; the rest is global.
   */
  async getDashboard(storeId = 6) {
    const [notice, joinees, products, ceoMessage, overview, news, birthdays] = await Promise.all([
      HeroRndNoticeBoard.findByPk(1),
      HeroRndJoinees.findAll({
        where: { status: '1', storeId } as any,
        order: [['id', 'DESC']],
        limit: 12,
      }),
      HeroRndCompetitorProduct.findAll({
        where: { status: '1' } as any,
        order: [['id', 'ASC']],
      }),
      Message.findByPk(2),
      Message.findByPk(3),
      News.findAll({
        where: { isFeatured: '1', status: '1', store: storeId } as any,
        order: [['newsDate', 'DESC']],
        limit: 6,
      }).catch(() => []),
      this.recentBirthdays(),
    ]);
    return { notice, joinees, products, ceoMessage, overview, news, birthdays };
  }

  /**
   * Today + next-7-day birthdays, mirroring legacy
   * `Employee\Entity\Employee::recentBirthhday()`. Returns name, designation,
   * department and birth date so the dashboard can render avatar cards.
   */
  async recentBirthdays(days = 7) {
    // NOTE: employee.user_id is the PK (NOT `id`); `state` is the active flag
    // (enum '0','1','3','4'); `department` is an FK to the department table.
    // Use `function_text` as a friendly department fallback to avoid a JOIN.
    const rows = (await getDb().query(
      `SELECT user_id AS id, name,
              designation AS designation,
              function_text AS department,
              dob, profilepic
         FROM employee
        WHERE dob IS NOT NULL
          AND state = '1'
          AND DAYOFYEAR(dob) >= DAYOFYEAR(CURDATE())
          AND DAYOFYEAR(dob) <= DAYOFYEAR(DATE_ADD(CURDATE(), INTERVAL :days DAY))
        ORDER BY DAYOFYEAR(dob) ASC
        LIMIT 30`,
      { replacements: { days }, type: QueryTypes.SELECT },
    )) as Array<{ id: number; name: string; designation?: string; department?: string; dob?: string; profilepic?: string }>;
    return rows;
  }
}
