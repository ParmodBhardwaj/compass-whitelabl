import { Injectable, NotFoundException } from '@nestjs/common';
import { Op, getDb, QueryTypes } from '@hero/db';
import bcrypt from 'bcryptjs';
import {
  Department,
  HeroLocation,
  HeroSetting,
  MeetingDocument,
  HeroCategory,
  HeroSubCategory,
  HeroApiUsers,
  HomeBanners,
  HeroBanners,
  EmployeeDtlAllPlants,
  SopLevel1,
  SopSections,
  SopProcess,
  SopFeedback,
  SopActivityTracker,
} from '@hero/db/src/models/generated';

/**
 * Master-data admin service. Backs the small CRUD admin pages for tables
 * that don't deserve their own module — Department, Location, Setting,
 * etc. Each entity gets a self-contained `<Entity>` group of methods below.
 */
@Injectable()
export class MasterDataService {
  // ── Departments ───────────────────────────────────────────────────────────

  async listDepartments(opts: { q?: string; includeDeleted?: boolean } = {}) {
    const where: any = {};
    if (!opts.includeDeleted) where.isDeleted = '0';
    if (opts.q) where.name = { [Op.like]: `%${opts.q}%` };
    return Department.findAll({ where, order: [['sortOrder', 'ASC'], ['name', 'ASC']] });
  }

  async createDepartment(dto: { name: string; plantId?: number; sortOrder?: number; status?: '0'|'1' }) {
    return Department.create({
      name: dto.name,
      plantId: dto.plantId ?? 0,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
      isDeleted: '0',
    } as any);
  }

  async updateDepartment(id: number, dto: Partial<{
    name: string; plantId: number; sortOrder: number; status: '0'|'1';
  }>) {
    const row = await Department.findByPk(id);
    if (!row) throw new NotFoundException('Department not found');
    await row.update(dto as any);
    return row;
  }

  async deleteDepartment(id: number) {
    const row = await Department.findByPk(id);
    if (!row) throw new NotFoundException('Department not found');
    await row.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Locations ─────────────────────────────────────────────────────────────

  async listLocations(opts: { q?: string } = {}) {
    const where: any = {};
    if (opts.q) {
      where[Op.or] = [
        { locationText: { [Op.like]: `%${opts.q}%` } },
        { location: { [Op.like]: `%${opts.q}%` } },
      ];
    }
    return HeroLocation.findAll({ where, order: [['locationText', 'ASC']] });
  }

  async createLocation(dto: { locationText: string; location: string }) {
    return HeroLocation.create(dto as any);
  }

  async updateLocation(id: number, dto: Partial<{ locationText: string; location: string }>) {
    const row = await HeroLocation.findByPk(id);
    if (!row) throw new NotFoundException('Location not found');
    await row.update(dto as any);
    return row;
  }

  async deleteLocation(id: number) {
    const row = await HeroLocation.findByPk(id);
    if (!row) throw new NotFoundException('Location not found');
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  async listSettings(opts: { settingGroup?: string; storeId?: number; q?: string } = {}) {
    const where: any = {};
    if (opts.settingGroup) where.settingGroup = opts.settingGroup;
    if (opts.storeId) where.storeId = opts.storeId;
    if (opts.q) where.title = { [Op.like]: `%${opts.q}%` };
    return HeroSetting.findAll({ where, order: [['settingGroup', 'ASC'], ['title', 'ASC']] });
  }

  async createSetting(dto: {
    title: string;
    settingId: string;
    settingValue?: string;
    settingGroup: string;
    storeId?: number;
  }) {
    return HeroSetting.create({
      title: dto.title,
      settingId: dto.settingId,
      settingValue: dto.settingValue ?? null,
      settingGroup: dto.settingGroup,
      storeId: dto.storeId ?? 1,
    } as any);
  }

  async updateSetting(id: number, dto: Partial<{
    title: string;
    settingId: string;
    settingValue: string;
    settingGroup: string;
    storeId: number;
  }>) {
    const row = await HeroSetting.findByPk(id);
    if (!row) throw new NotFoundException('Setting not found');
    await row.update(dto as any);
    return row;
  }

  async deleteSetting(id: number) {
    const row = await HeroSetting.findByPk(id);
    if (!row) throw new NotFoundException('Setting not found');
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Meeting Documents (doc + summary share the same table) ───────────────

  /**
   * `meeting_document` stores BOTH:
   *   • Leadership Meeting Documents (doc_type='doc')
   *   • Action Items and MoMs        (doc_type='summary')
   * The admin pages call with a `docType` query so they see only their
   * own bucket and writes auto-tag with the right doc_type.
   */
  async listMeetingDocuments(opts: { docType: 'doc' | 'summary'; q?: string } = { docType: 'doc' }) {
    const where: any = { docType: opts.docType, isDeleted: '0' };
    if (opts.q) where.title = { [Op.like]: `%${opts.q}%` };
    return MeetingDocument.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'DESC']],
    });
  }

  async createMeetingDocument(dto: {
    docType: 'doc' | 'summary';
    title: string;
    uploadedDate?: string;
    uploadedFile?: string;
    tags?: string;
    uploadedBy: number;
    sortOrder?: number;
    status?: '0'|'1';
  }) {
    return MeetingDocument.create({
      docType: dto.docType,
      title: dto.title,
      uploadedDate: dto.uploadedDate ?? new Date().toISOString().slice(0, 10),
      uploadedFile: dto.uploadedFile ?? null,
      tags: dto.tags ?? null,
      uploadedBy: dto.uploadedBy,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }

  async updateMeetingDocument(id: number, dto: any) {
    const row = await MeetingDocument.findByPk(id);
    if (!row) throw new NotFoundException('Document not found');
    await row.update(dto);
    return row;
  }

  async deleteMeetingDocument(id: number) {
    const row = await MeetingDocument.findByPk(id);
    if (!row) throw new NotFoundException('Document not found');
    await row.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Training / Finance / MPSheet categories (shared hero_category) ───────

  /** `hero_category.type` enum: 'training' | 'finance' | 'mpsheet'. */
  async listCategories(opts: { type: 'training' | 'finance' | 'mpsheet'; q?: string }) {
    const where: any = { type: opts.type, isDeleted: '0' };
    if (opts.q) where.name = { [Op.like]: `%${opts.q}%` };
    return HeroCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });
  }

  async createCategory(dto: { name: string; type: 'training' | 'finance' | 'mpsheet'; sortOrder?: number; status?: '0'|'1' }) {
    return HeroCategory.create({
      name: dto.name,
      type: dto.type,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
      isDeleted: '0',
    } as any);
  }

  async updateCategory(id: number, dto: any) {
    const row = await HeroCategory.findByPk(id);
    if (!row) throw new NotFoundException('Category not found');
    await row.update(dto);
    return row;
  }

  async deleteCategory(id: number) {
    const row = await HeroCategory.findByPk(id);
    if (!row) throw new NotFoundException('Category not found');
    await row.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Sub-categories (hero_sub_category, type=training only for now) ───────

  async listSubCategories(opts: { type: 'training'; categoryId?: number; q?: string }) {
    const where: any = { type: opts.type, isDeleted: '0' };
    if (opts.categoryId) where.categoryId = opts.categoryId;
    if (opts.q) where.name = { [Op.like]: `%${opts.q}%` };
    return HeroSubCategory.findAll({ where, order: [['sortOrder', 'ASC'], ['name', 'ASC']] });
  }

  async createSubCategory(dto: {
    categoryId: number; name: string;
    type: 'training'; extraField?: string; sortOrder?: number; status?: '0'|'1';
  }) {
    return HeroSubCategory.create({
      categoryId: dto.categoryId,
      name: dto.name,
      extraField: dto.extraField ?? null,
      type: dto.type,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
      isDeleted: '0',
    } as any);
  }

  async updateSubCategory(id: number, dto: any) {
    const row = await HeroSubCategory.findByPk(id);
    if (!row) throw new NotFoundException('Sub-category not found');
    await row.update(dto);
    return row;
  }

  async deleteSubCategory(id: number) {
    const row = await HeroSubCategory.findByPk(id);
    if (!row) throw new NotFoundException('Sub-category not found');
    await row.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Login usage report (read-only) ───────────────────────────────────────

  /**
   * Aggregates `hero_login_usage` joined with `employee` so the admin sees
   * who logged in, how many times, and when last. Matches legacy
   * /admin/login-usage report exactly.
   */
  async loginUsageReport(opts: { from?: string; to?: string; limit?: number } = {}) {
    const limit = Math.min(opts.limit ?? 200, 1000);
    const where: string[] = [];
    const replacements: any = { limit };
    if (opts.from) { where.push('h.creation_date >= :from'); replacements.from = opts.from; }
    if (opts.to)   { where.push('h.creation_date <= :to');   replacements.to = opts.to; }
    const sql = `
      SELECT e.user_id    AS userId,
             e.ecode      AS ecode,
             e.name       AS name,
             e.email      AS email,
             e.designation AS designation,
             COUNT(*)     AS loginCount,
             MAX(h.creation_date) AS lastLogin
        FROM hero_login_usage h
        LEFT JOIN employee e ON e.user_id = h.user_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       GROUP BY e.user_id, e.ecode, e.name, e.email, e.designation
       ORDER BY lastLogin DESC
       LIMIT :limit`;
    return getDb().query(sql, { replacements, type: QueryTypes.SELECT });
  }

  // ── REST API users ───────────────────────────────────────────────────────

  async listApiUsers(opts: { q?: string } = {}) {
    const where: any = {};
    if (opts.q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${opts.q}%` } },
        { username: { [Op.like]: `%${opts.q}%` } },
      ];
    }
    return HeroApiUsers.findAll({
      where,
      // Never leak password hashes to the admin grid.
      attributes: ['id', 'title', 'username', 'status'],
      order: [['id', 'DESC']],
    });
  }

  async createApiUser(dto: { title: string; username: string; password: string; status?: '0'|'1' }) {
    const hash = await bcrypt.hash(dto.password, 10);
    return HeroApiUsers.create({
      title: dto.title,
      username: dto.username,
      password: hash,
      status: dto.status ?? '1',
    } as any);
  }

  async updateApiUser(id: number, dto: Partial<{
    title: string; username: string; password: string; status: '0'|'1';
  }>) {
    const row = await HeroApiUsers.findByPk(id);
    if (!row) throw new NotFoundException('API user not found');
    const patch: any = { ...dto };
    if (dto.password) patch.password = await bcrypt.hash(dto.password, 10);
    await row.update(patch);
    return { id: (row as any).id, updated: true };
  }

  async deleteApiUser(id: number) {
    const row = await HeroApiUsers.findByPk(id);
    if (!row) throw new NotFoundException('API user not found');
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Landing Page Images (home_banners) ───────────────────────────────────

  async listLandingImages() {
    return HomeBanners.findAll({ order: [['id', 'DESC']] });
  }
  async createLandingImage(dto: { image?: string; url?: string }) {
    return HomeBanners.create({ image: dto.image ?? '', url: dto.url ?? '' } as any);
  }
  async updateLandingImage(id: number, dto: Partial<{ image: string; url: string }>) {
    const row = await HomeBanners.findByPk(id);
    if (!row) throw new NotFoundException('Image not found');
    await row.update(dto);
    return row;
  }
  async deleteLandingImage(id: number) {
    const row = await HomeBanners.findByPk(id);
    if (!row) throw new NotFoundException('Image not found');
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Upcoming Banners (hero_banners) ──────────────────────────────────────

  async listUpcomingBanners(opts: { storeId?: number; q?: string } = {}) {
    const where: any = {};
    if (opts.storeId) where.store = opts.storeId;
    if (opts.q) where.title = { [Op.like]: `%${opts.q}%` };
    return HeroBanners.findAll({ where, order: [['sortOrder', 'ASC'], ['id', 'DESC']] });
  }
  async createUpcomingBanner(dto: {
    title?: string; content?: string; image?: string; url?: string;
    sortOrder?: number; isActive?: '0'|'1'; store?: number;
  }) {
    return HeroBanners.create({
      title: dto.title ?? null,
      content: dto.content ?? null,
      image: dto.image ?? null,
      url: dto.url ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? '1',
      store: dto.store ?? 1,
    } as any);
  }
  async updateUpcomingBanner(id: number, dto: any) {
    const row = await HeroBanners.findByPk(id);
    if (!row) throw new NotFoundException('Banner not found');
    await row.update(dto);
    return row;
  }
  async deleteUpcomingBanner(id: number) {
    const row = await HeroBanners.findByPk(id);
    if (!row) throw new NotFoundException('Banner not found');
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Off-role Employees (employee_dtl_all_plants) ─────────────────────────

  async listOffRoleEmployees(opts: { q?: string; limit?: number } = {}) {
    const where: any = {};
    if (opts.q) {
      where[Op.or] = [
        { NAME: { [Op.like]: `%${opts.q}%` } },
        { EC_NO: { [Op.like]: `%${opts.q}%` } },
        { OLD_EC_NO: { [Op.like]: `%${opts.q}%` } },
      ];
    }
    return EmployeeDtlAllPlants.findAll({
      where,
      order: [['NAME', 'ASC']],
      limit: Math.min(opts.limit ?? 500, 2000),
    });
  }

  // ── SOP Level 1 (sop_level1) ─────────────────────────────────────────────

  async listSopLevel1(opts: { q?: string } = {}) {
    const where: any = {};
    if (opts.q) where.title = { [Op.like]: `%${opts.q}%` };
    return SopLevel1.findAll({ where, order: [['id', 'DESC']] });
  }
  async createSopLevel1(dto: { title: string; levelOneFile?: string }) {
    return SopLevel1.create({
      title: dto.title,
      levelOneFile: dto.levelOneFile ?? '',
      createdAt: new Date(),
    } as any);
  }
  async updateSopLevel1(id: number, dto: any) {
    const row = await SopLevel1.findByPk(id);
    if (!row) throw new NotFoundException('Level One not found');
    await row.update(dto);
    return row;
  }
  async deleteSopLevel1(id: number) {
    const row = await SopLevel1.findByPk(id);
    if (!row) throw new NotFoundException('Level One not found');
    await row.destroy();
    return { id, deleted: true };
  }

  // ── SOP Sections (sop_sections) — Departments per SOP type ───────────────

  async listSopSections(opts: { type?: 'ss&sc' | 'plant-operation'; q?: string } = {}) {
    const where: any = { type: opts.type ?? 'ss&sc' };
    if (opts.q) where.name = { [Op.like]: `%${opts.q}%` };
    return SopSections.findAll({ where, order: [['sortOrder', 'ASC'], ['name', 'ASC']] });
  }
  async createSopSection(dto: {
    name: string; type?: 'ss&sc' | 'plant-operation';
    departmentHead?: number; sortOrder?: number; status?: '0'|'1';
  }) {
    return SopSections.create({
      name: dto.name,
      type: dto.type ?? 'ss&sc',
      departmentHead: dto.departmentHead ?? 0,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? '1',
    } as any);
  }
  async updateSopSection(id: number, dto: any) {
    const row = await SopSections.findByPk(id);
    if (!row) throw new NotFoundException('Section not found');
    await row.update(dto);
    return row;
  }
  async deleteSopSection(id: number) {
    const row = await SopSections.findByPk(id);
    if (!row) throw new NotFoundException('Section not found');
    await row.destroy();
    return { id, deleted: true };
  }

  // ── SOP Processes (read-only summary for admin) ──────────────────────────

  async listSopProcesses(opts: { sectionId?: number; q?: string; limit?: number } = {}) {
    const where: any = { isDeleted: '0' };
    if (opts.sectionId) where.sectionId = opts.sectionId;
    if (opts.q) where.title = { [Op.like]: `%${opts.q}%` };
    return SopProcess.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'DESC']],
      limit: Math.min(opts.limit ?? 200, 1000),
    });
  }

  // ── SOP Feedback (sop_feedback) ──────────────────────────────────────────

  async listSopFeedback(opts: { q?: string } = {}) {
    const where: any = {};
    if (opts.q) where.feedback = { [Op.like]: `%${opts.q}%` };
    return SopFeedback.findAll({ where, order: [['id', 'DESC']], limit: 500 });
  }
  async replySopFeedback(id: number, feedbackReply: string) {
    const row = await SopFeedback.findByPk(id);
    if (!row) throw new NotFoundException('Feedback not found');
    await row.update({ feedbackReply } as any);
    return row;
  }
  async deleteSopFeedback(id: number) {
    const row = await SopFeedback.findByPk(id);
    if (!row) throw new NotFoundException('Feedback not found');
    await row.destroy();
    return { id, deleted: true };
  }

  // ── SOP Activity Tracker (read-only report) ──────────────────────────────

  /**
   * Aggregates `sop_activity_tracker` joined with employee for the admin
   * Activity Report. Date range filterable.
   */
  async sopActivityReport(opts: { from?: string; to?: string; userId?: number; limit?: number } = {}) {
    const limit = Math.min(opts.limit ?? 200, 1000);
    const where: string[] = [];
    const replacements: any = { limit };
    if (opts.from) { where.push('a.activity_date >= :from'); replacements.from = opts.from; }
    if (opts.to)   { where.push('a.activity_date <= :to');   replacements.to = opts.to; }
    if (opts.userId) { where.push('a.user_id = :uid');       replacements.uid = opts.userId; }
    const sql = `
      SELECT a.id           AS id,
             a.user_id      AS userId,
             e.ecode        AS ecode,
             e.name         AS name,
             e.email        AS email,
             a.activity_description AS activityDescription,
             a.activity_date AS activityDate,
             a.created_at   AS createdAt
        FROM sop_activity_tracker a
        LEFT JOIN employee e ON e.user_id = a.user_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY a.activity_date DESC, a.id DESC
       LIMIT :limit`;
    return getDb().query(sql, { replacements, type: QueryTypes.SELECT });
  }
}
