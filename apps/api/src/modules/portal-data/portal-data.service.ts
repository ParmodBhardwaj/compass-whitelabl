import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  CpOfficeLocations,
  CpRideOffers,
  HeroSaleCategory,
  IdeaBannerContent,
  HeroRndNoticeBoard,
  HeroRndJoinees,
  HeroRndCompetitorProduct,
  HeroDiEvents,
  HeroDiInitiative,
  HeroDiNewsletter,
  HeroDiVideo,
  HeroDiFeatured,
  QaSubdepartment,
  QaInitiator,
  QaFiUsers,
  OeeLine,
  OeeGroup,
  OeeMachine,
  OeeHoliday,
  OeeLossCategory,
  OeeBottleneck,
  OeeDepartment,
  AuditInternalTeam,
  AuditCutoffDate,
} from '@hero/db/src/models/generated';

/**
 * Portal-data admin service. Covers small CRUD tables used by Car Pool, Sale/Rent,
 * Idea Portal, R&D, D&I, Quality Alert, OEE, and Audit Tracker admins.
 *
 * Each entity gets a 4-method group (list / create / update / delete). They're
 * intentionally tiny so the admin pages can compose them via MasterDataPanel
 * with minimal boilerplate.
 */
@Injectable()
export class PortalDataService {
  // ── Car Pool — Locations + Rides ─────────────────────────────────────
  cpLocations()              { return CpOfficeLocations.findAll({ order: [['sortOrder', 'ASC']] }); }
  createCpLocation(b: any)   { return CpOfficeLocations.create({
    city: b.city, area: b.area, sortOrder: b.sortOrder ?? 0,
  } as any); }
  async updateCpLocation(id: number, b: any) {
    const r = await CpOfficeLocations.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteCpLocation(id: number) {
    const r = await CpOfficeLocations.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  cpRides()                  { return CpRideOffers.findAll({ order: [['id', 'DESC']] }); }
  createCpRide(b: any)       { return CpRideOffers.create(b as any); }
  async updateCpRide(id: number, b: any) {
    const r = await CpRideOffers.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteCpRide(id: number) {
    const r = await CpRideOffers.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  // ── Sale/Rent — Categories ───────────────────────────────────────────
  saleCategories()           { return HeroSaleCategory.findAll({ order: [['sort', 'ASC']] }); }
  createSaleCategory(b: any) { return HeroSaleCategory.create({
    title: b.title, sort: b.sort ?? 0, status: b.status ?? '1',
  } as any); }
  async updateSaleCategory(id: number, b: any) {
    const r = await HeroSaleCategory.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteSaleCategory(id: number) {
    const r = await HeroSaleCategory.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  // ── Idea Portal — Content blocks ─────────────────────────────────────
  ideaContent()              { return IdeaBannerContent.findAll({ order: [['id', 'ASC']] }); }
  createIdeaContent(b: any)  { return IdeaBannerContent.create({
    title: b.title, description: b.description, status: b.status ?? '1',
  } as any); }
  async updateIdeaContent(id: number, b: any) {
    const r = await IdeaBannerContent.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteIdeaContent(id: number) {
    const r = await IdeaBannerContent.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  // ── R&D Portal ───────────────────────────────────────────────────────
  rndNotices()               { return HeroRndNoticeBoard.findAll({ order: [['id', 'DESC']] }); }
  createRndNotice(b: any)    { return HeroRndNoticeBoard.create({
    description: b.description, status: b.status ?? '1',
  } as any); }
  async updateRndNotice(id: number, b: any) {
    const r = await HeroRndNoticeBoard.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteRndNotice(id: number) {
    const r = await HeroRndNoticeBoard.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  rndJoinees()               { return HeroRndJoinees.findAll({ where: { isDeleted: '0' } as any, order: [['id', 'DESC']] }); }
  createRndJoinee(b: any)    { return HeroRndJoinees.create({
    name: b.name ?? '', designation: b.designation ?? '', description: b.description ?? '',
    image: b.image ?? '', status: b.status ?? '1', storeId: b.storeId ?? 6, type: b.type ?? '',
    isDeleted: '0',
  } as any); }
  async updateRndJoinee(id: number, b: any) {
    const r = await HeroRndJoinees.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteRndJoinee(id: number) {
    const r = await HeroRndJoinees.findByPk(id); if (!r) throw new NotFoundException();
    await r.update({ isDeleted: '1' } as any); return { id, deleted: true };
  }

  rndCompetitorProducts()    { return HeroRndCompetitorProduct.findAll({ order: [['id', 'DESC']] }); }
  createRndCompetitor(b: any){ return HeroRndCompetitorProduct.create({
    name: b.name, price: b.price, description: b.description ?? '',
    image: b.image ?? '', status: b.status ?? '1',
  } as any); }
  async updateRndCompetitor(id: number, b: any) {
    const r = await HeroRndCompetitorProduct.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteRndCompetitor(id: number) {
    const r = await HeroRndCompetitorProduct.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  // ── D&I ──────────────────────────────────────────────────────────────
  dniEvents()       { return HeroDiEvents.findAll({ where: { isDeleted: '0' } as any, order: [['startDate', 'DESC']] }); }
  createDniEvent(b: any) {
    return HeroDiEvents.create({
      title: b.title, alias: (b.alias ?? slug(b.title)),
      shortDescription: b.shortDescription ?? '', description: b.description ?? '',
      eventType: b.eventType ?? 'event', externalLink: b.externalLink ?? '',
      categoryId: b.categoryId ?? null,
      startDate: b.startDate ?? new Date().toISOString().slice(0, 10),
      endDate: b.endDate ?? new Date().toISOString().slice(0, 10),
      startTime: b.startTime ?? null, endTime: b.endTime ?? null,
      image: b.image ?? '', location: b.location ?? '',
      storeId: 8, sortOrder: b.sortOrder ?? 0,
      status: b.status ?? '1', isFeatured: b.isFeatured ?? '0', isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }
  async updateDniEvent(id: number, b: any) {
    const r = await HeroDiEvents.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteDniEvent(id: number) {
    const r = await HeroDiEvents.findByPk(id); if (!r) throw new NotFoundException();
    await r.update({ isDeleted: '1' } as any); return { id, deleted: true };
  }

  dniInitiatives()  { return HeroDiInitiative.findAll({ where: { isDeleted: '0' } as any, order: [['sortOrder', 'ASC']] }); }
  createDniInitiative(b: any) {
    return HeroDiInitiative.create({
      name: b.name, alias: b.alias ?? slug(b.name),
      shortDescription: b.shortDescription ?? '', description: b.description ?? '',
      image: b.image ?? '', storeId: 8, sortOrder: b.sortOrder ?? 0,
      status: b.status ?? '1', isFeatured: b.isFeatured ?? '0', isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }
  async updateDniInitiative(id: number, b: any) {
    const r = await HeroDiInitiative.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteDniInitiative(id: number) {
    const r = await HeroDiInitiative.findByPk(id); if (!r) throw new NotFoundException();
    await r.update({ isDeleted: '1' } as any); return { id, deleted: true };
  }

  dniNewsletters()  { return HeroDiNewsletter.findAll({ where: { isDeleted: '0' } as any, order: [['sortOrder', 'ASC']] }); }
  createDniNewsletter(b: any) {
    return HeroDiNewsletter.create({
      name: b.name, alias: b.alias ?? slug(b.name),
      shortDescription: b.shortDescription ?? '', description: b.description ?? '',
      image: b.image ?? '', storeId: 8, sortOrder: b.sortOrder ?? 0,
      status: b.status ?? '1', isFeatured: b.isFeatured ?? '0', isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }
  async updateDniNewsletter(id: number, b: any) {
    const r = await HeroDiNewsletter.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteDniNewsletter(id: number) {
    const r = await HeroDiNewsletter.findByPk(id); if (!r) throw new NotFoundException();
    await r.update({ isDeleted: '1' } as any); return { id, deleted: true };
  }

  dniVideos()       { return HeroDiVideo.findAll({ where: { isDeleted: '0' } as any, order: [['sortOrder', 'ASC']] }); }
  createDniVideo(b: any) {
    return HeroDiVideo.create({
      name: b.name, alias: b.alias ?? slug(b.name),
      shortDescription: b.shortDescription ?? '', description: b.description ?? '',
      image: b.image ?? '', storeId: 8, sortOrder: b.sortOrder ?? 0,
      status: b.status ?? '1', isFeatured: b.isFeatured ?? '0', isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }
  async updateDniVideo(id: number, b: any) {
    const r = await HeroDiVideo.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteDniVideo(id: number) {
    const r = await HeroDiVideo.findByPk(id); if (!r) throw new NotFoundException();
    await r.update({ isDeleted: '1' } as any); return { id, deleted: true };
  }

  dniFeatured()     { return HeroDiFeatured.findAll({ where: { isDeleted: '0' } as any, order: [['featuredDate', 'DESC']] }); }
  createDniFeatured(b: any) {
    return HeroDiFeatured.create({
      title: b.title, alias: b.alias ?? slug(b.title),
      shortDescription: b.shortDescription ?? '', description: b.description ?? '',
      featuredDate: b.featuredDate ?? new Date().toISOString().slice(0, 10),
      image: b.image ?? '', storeId: 8, sortOrder: b.sortOrder ?? 0,
      status: b.status ?? '1', isFeatured: b.isFeatured ?? '0', isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }
  async updateDniFeatured(id: number, b: any) {
    const r = await HeroDiFeatured.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteDniFeatured(id: number) {
    const r = await HeroDiFeatured.findByPk(id); if (!r) throw new NotFoundException();
    await r.update({ isDeleted: '1' } as any); return { id, deleted: true };
  }

  // ── Quality Alert — masters ──────────────────────────────────────────
  qaSubdepartments() { return QaSubdepartment.findAll({ order: [['id', 'ASC']] }); }
  createQaSubdept(b: any) { return QaSubdepartment.create(b as any); }
  async updateQaSubdept(id: number, b: any) {
    const r = await QaSubdepartment.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteQaSubdept(id: number) {
    const r = await QaSubdepartment.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  qaInitiators()  { return QaInitiator.findAll({ order: [['id', 'ASC']] }); }
  createQaInitiator(b: any) { return QaInitiator.create(b as any); }
  async deleteQaInitiator(id: number) {
    const r = await QaInitiator.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  qaFiUsers()     { return QaFiUsers.findAll({ order: [['id', 'ASC']] }); }
  createQaFiUser(b: any) { return QaFiUsers.create(b as any); }
  async deleteQaFiUser(id: number) {
    const r = await QaFiUsers.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  // ── OEE — masters ────────────────────────────────────────────────────
  oeeLines()      { return OeeLine.findAll({ order: [['name', 'ASC']] }); }
  createOeeLine(b: any) { return OeeLine.create(b as any); }
  async updateOeeLine(id: number, b: any) {
    const r = await OeeLine.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteOeeLine(id: number) {
    const r = await OeeLine.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  oeeGroups()     { return OeeGroup.findAll({ order: [['name', 'ASC']] }); }
  createOeeGroup(b: any) { return OeeGroup.create(b as any); }
  async updateOeeGroup(id: number, b: any) {
    const r = await OeeGroup.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteOeeGroup(id: number) {
    const r = await OeeGroup.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  oeeMachines()   { return OeeMachine.findAll({ order: [['name', 'ASC']] }); }
  createOeeMachine(b: any) { return OeeMachine.create(b as any); }
  async updateOeeMachine(id: number, b: any) {
    const r = await OeeMachine.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteOeeMachine(id: number) {
    const r = await OeeMachine.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  oeeHolidays()   { return OeeHoliday.findAll({ order: [['holidayDate', 'DESC']] }); }
  createOeeHoliday(b: any) { return OeeHoliday.create(b as any); }
  async deleteOeeHoliday(id: number) {
    const r = await OeeHoliday.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  oeeLossCategories() { return OeeLossCategory.findAll({ order: [['name', 'ASC']] }); }
  createOeeLossCategory(b: any) { return OeeLossCategory.create(b as any); }
  async deleteOeeLossCategory(id: number) {
    const r = await OeeLossCategory.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  oeeBottlenecks() { return OeeBottleneck.findAll({ order: [['id', 'DESC']] }); }
  createOeeBottleneck(b: any) { return OeeBottleneck.create(b as any); }
  async deleteOeeBottleneck(id: number) {
    const r = await OeeBottleneck.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  oeeDepartments() { return OeeDepartment.findAll({ order: [['name', 'ASC']] }); }
  createOeeDepartment(b: any) { return OeeDepartment.create(b as any); }
  async updateOeeDepartment(id: number, b: any) {
    const r = await OeeDepartment.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteOeeDepartment(id: number) {
    const r = await OeeDepartment.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  // ── Audit Tracker ────────────────────────────────────────────────────
  auditTeams()    { return AuditInternalTeam.findAll({ order: [['id', 'DESC']] }); }
  createAuditTeam(b: any) { return AuditInternalTeam.create(b as any); }
  async updateAuditTeam(id: number, b: any) {
    const r = await AuditInternalTeam.findByPk(id); if (!r) throw new NotFoundException();
    await r.update(b); return r;
  }
  async deleteAuditTeam(id: number) {
    const r = await AuditInternalTeam.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }

  auditCutoffDates() { return AuditCutoffDate.findAll({ order: [['cutoffDate', 'DESC']] }); }
  createAuditCutoff(b: any)  { return AuditCutoffDate.create(b as any); }
  async deleteAuditCutoff(id: number) {
    const r = await AuditCutoffDate.findByPk(id); if (!r) throw new NotFoundException();
    await r.destroy(); return { id, deleted: true };
  }
}

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 255);
}
