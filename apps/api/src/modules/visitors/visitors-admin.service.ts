import { Injectable, NotFoundException } from '@nestjs/common';
import {
  VisitorLocations,
  VisitorInstructions,
  VisitorApprovalMembers,
  VisitorDisabledFields,
  VisitorSecurityMembers,
  VisitorCanteenMember,
  VisitorReceptionMember,
  VisitorFeedbackLocationDept,
  VisitorFeedbackQuestions,
  VisitorPass,
  VisitorLocationWiseGrades,
} from '@hero/db/src/models/generated';

/**
 * Visitors module — admin CRUD service.
 *
 * Backs the 12 Visitor Portal admin pages (Locations, Instructions, Approval
 * Members, Disabled Fields, Security Members, Canteen / Reception Members,
 * Feedback Location-Dept, Visitor / Employee Feedback Questions, Pass Types,
 * Grades-for-Red-Pass).
 *
 * Each resource exposes list / create / update / delete. The web admin uses
 * the shared MasterDataPanel against `/v2/visitors/admin/*`.
 */
@Injectable()
export class VisitorsAdminService {
  // ── Locations ──────────────────────────────────────────────────────────
  listLocations() { return VisitorLocations.findAll({ order: [['id', 'ASC']] }); }
  createLocation(b: any)  { return VisitorLocations.create(b as any); }
  async updateLocation(id: number, b: any) {
    const r = await VisitorLocations.findByPk(id);
    if (!r) throw new NotFoundException('Location not found');
    await r.update(b as any); return r;
  }
  async deleteLocation(id: number) {
    const r = await VisitorLocations.findByPk(id);
    if (!r) throw new NotFoundException('Location not found');
    await r.destroy(); return { id, deleted: true };
  }

  // ── Instructions ───────────────────────────────────────────────────────
  listInstructions(locationId?: number) {
    const where: any = {}; if (locationId) where.locationId = locationId;
    return VisitorInstructions.findAll({ where, order: [['sortOrder', 'ASC']] });
  }
  createInstruction(b: any) { return VisitorInstructions.create(b as any); }
  async updateInstruction(id: number, b: any) {
    const r = await VisitorInstructions.findByPk(id);
    if (!r) throw new NotFoundException('Instruction not found');
    await r.update(b as any); return r;
  }
  async deleteInstruction(id: number) {
    const r = await VisitorInstructions.findByPk(id);
    if (!r) throw new NotFoundException('Instruction not found');
    await r.destroy(); return { id, deleted: true };
  }

  // ── Approval Members ───────────────────────────────────────────────────
  listApprovalMembers(locationId?: number) {
    const where: any = {}; if (locationId) where.locationId = locationId;
    return VisitorApprovalMembers.findAll({ where, order: [['id', 'ASC']] });
  }
  createApprovalMember(b: any) {
    return VisitorApprovalMembers.create({
      ...b,
      passTypeApproval: b.passTypeApproval ?? 'all',
      createdOn: new Date(),
    } as any);
  }
  async updateApprovalMember(id: number, b: any) {
    const r = await VisitorApprovalMembers.findByPk(id);
    if (!r) throw new NotFoundException('Approval member not found');
    await r.update(b as any); return r;
  }
  async deleteApprovalMember(id: number) {
    const r = await VisitorApprovalMembers.findByPk(id);
    if (!r) throw new NotFoundException('Approval member not found');
    await r.destroy(); return { id, deleted: true };
  }

  // ── Disabled Fields ────────────────────────────────────────────────────
  listDisabledFields(locationId?: number) {
    const where: any = {}; if (locationId) where.locationId = locationId;
    return VisitorDisabledFields.findAll({ where, order: [['id', 'ASC']] });
  }
  createDisabledField(b: any) {
    return VisitorDisabledFields.create({ ...b, createdOn: new Date() } as any);
  }
  async updateDisabledField(id: number, b: any) {
    const r = await VisitorDisabledFields.findByPk(id);
    if (!r) throw new NotFoundException('Disabled field not found');
    await r.update(b as any); return r;
  }
  async deleteDisabledField(id: number) {
    const r = await VisitorDisabledFields.findByPk(id);
    if (!r) throw new NotFoundException('Disabled field not found');
    await r.destroy(); return { id, deleted: true };
  }

  // ── Security Members ───────────────────────────────────────────────────
  listSecurityMembers(locationId?: number) {
    const where: any = {}; if (locationId) where.locationId = locationId;
    return VisitorSecurityMembers.findAll({ where, order: [['id', 'ASC']] });
  }
  createSecurityMember(b: any) {
    return VisitorSecurityMembers.create({ ...b, createdOn: new Date() } as any);
  }
  async updateSecurityMember(id: number, b: any) {
    const r = await VisitorSecurityMembers.findByPk(id);
    if (!r) throw new NotFoundException('Security member not found');
    await r.update(b as any); return r;
  }
  async deleteSecurityMember(id: number) {
    const r = await VisitorSecurityMembers.findByPk(id);
    if (!r) throw new NotFoundException('Security member not found');
    await r.destroy(); return { id, deleted: true };
  }

  // ── Canteen Members ────────────────────────────────────────────────────
  listCanteenMembers(locationId?: number) {
    const where: any = {}; if (locationId) where.locationId = locationId;
    return VisitorCanteenMember.findAll({ where, order: [['id', 'ASC']] });
  }
  createCanteenMember(b: any) { return VisitorCanteenMember.create(b as any); }
  async updateCanteenMember(id: number, b: any) {
    const r = await VisitorCanteenMember.findByPk(id);
    if (!r) throw new NotFoundException('Canteen member not found');
    await r.update(b as any); return r;
  }
  async deleteCanteenMember(id: number) {
    const r = await VisitorCanteenMember.findByPk(id);
    if (!r) throw new NotFoundException('Canteen member not found');
    await r.destroy(); return { id, deleted: true };
  }

  // ── Reception Members ──────────────────────────────────────────────────
  listReceptionMembers(locationId?: number) {
    const where: any = {}; if (locationId) where.locationId = locationId;
    return VisitorReceptionMember.findAll({ where, order: [['id', 'ASC']] });
  }
  createReceptionMember(b: any) { return VisitorReceptionMember.create(b as any); }
  async updateReceptionMember(id: number, b: any) {
    const r = await VisitorReceptionMember.findByPk(id);
    if (!r) throw new NotFoundException('Reception member not found');
    await r.update(b as any); return r;
  }
  async deleteReceptionMember(id: number) {
    const r = await VisitorReceptionMember.findByPk(id);
    if (!r) throw new NotFoundException('Reception member not found');
    await r.destroy(); return { id, deleted: true };
  }

  // ── Feedback Location ↔ Department mapping ─────────────────────────────
  listFeedbackLocationDept(locationId?: number) {
    const where: any = {}; if (locationId) where.locationId = locationId;
    return VisitorFeedbackLocationDept.findAll({ where, order: [['id', 'ASC']] });
  }
  createFeedbackLocationDept(b: any) {
    return VisitorFeedbackLocationDept.create({ ...b, status: b.status ?? '1' } as any);
  }
  async updateFeedbackLocationDept(id: number, b: any) {
    const r = await VisitorFeedbackLocationDept.findByPk(id);
    if (!r) throw new NotFoundException('Feedback mapping not found');
    await r.update(b as any); return r;
  }
  async deleteFeedbackLocationDept(id: number) {
    const r = await VisitorFeedbackLocationDept.findByPk(id);
    if (!r) throw new NotFoundException('Feedback mapping not found');
    await r.destroy(); return { id, deleted: true };
  }

  // ── Feedback Questions (visitor + employee, single table, filter by type)
  listFeedbackQuestions(type?: 'visitor' | 'employee') {
    const where: any = { isDeleted: '0' };
    if (type) where.type = type;
    return VisitorFeedbackQuestions.findAll({ where, order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
  }
  createFeedbackQuestion(b: any) {
    return VisitorFeedbackQuestions.create({
      ...b,
      type: b.type ?? 'visitor',
      questionRating: b.questionRating ?? 5,
      status: b.status ?? '1',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }
  async updateFeedbackQuestion(id: number, b: any) {
    const r = await VisitorFeedbackQuestions.findByPk(id);
    if (!r) throw new NotFoundException('Feedback question not found');
    await r.update(b as any); return r;
  }
  async deleteFeedbackQuestion(id: number) {
    const r = await VisitorFeedbackQuestions.findByPk(id);
    if (!r) throw new NotFoundException('Feedback question not found');
    await r.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Visitor Pass Types ─────────────────────────────────────────────────
  listVisitorPasses(locationId?: number) {
    const where: any = {}; if (locationId) where.locationId = locationId;
    return VisitorPass.findAll({ where, order: [['id', 'ASC']] });
  }
  createVisitorPass(b: any) {
    return VisitorPass.create({
      ...b,
      status: b.status ?? '1',
      redPassApproval: b.redPassApproval ?? '0',
    } as any);
  }
  async updateVisitorPass(id: number, b: any) {
    const r = await VisitorPass.findByPk(id);
    if (!r) throw new NotFoundException('Pass type not found');
    await r.update(b as any); return r;
  }
  async deleteVisitorPass(id: number) {
    const r = await VisitorPass.findByPk(id);
    if (!r) throw new NotFoundException('Pass type not found');
    await r.destroy(); return { id, deleted: true };
  }

  // ── Grades for Red Pass ────────────────────────────────────────────────
  listLocationGrades(locationId?: number) {
    const where: any = {}; if (locationId) where.locationId = locationId;
    return VisitorLocationWiseGrades.findAll({ where, order: [['id', 'ASC']] });
  }
  createLocationGrade(b: any) { return VisitorLocationWiseGrades.create(b as any); }
  async updateLocationGrade(id: number, b: any) {
    const r = await VisitorLocationWiseGrades.findByPk(id);
    if (!r) throw new NotFoundException('Grade mapping not found');
    await r.update(b as any); return r;
  }
  async deleteLocationGrade(id: number) {
    const r = await VisitorLocationWiseGrades.findByPk(id);
    if (!r) throw new NotFoundException('Grade mapping not found');
    await r.destroy(); return { id, deleted: true };
  }
}
