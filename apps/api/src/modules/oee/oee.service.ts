import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  OeeRequest,
  OeeDepartment,
  OeeSection,
  OeeLine,
  OeeMachine,
  OeeGroup,
  OeeGroupUser,
  OeePhenomena,
  OeePhenomenaValue,
  OeeModel,
  OeeModelValue,
  OeeMonthlyGroupwiseData,
  OeeMonthlySectionwiseData,
} from '@hero/db/src/models/generated';

export interface OeeRequestDto {
  plantId: number;
  sectionId: number;
  lineId: number;
  shift: string;
  groupId: number;
  machineId: number;
  requestDate: string;
  availableTime: number;
  stdCycleTime: number;
  shutDownLoss?: string;
  actualCycleTime: number;
  remarks?: string;
  productionPlan: string;
  productionActual: string;
  netProduction: string;
  rejection?: string;
  rework?: number;
  speedLoss?: number;
  rejectionLoss?: string;
  reworkLoss?: number;
  identifiedLoss?: number;
  undefinedLoss?: string;
  totalLoss?: string;
  ecNo?: string;
  ecName?: string;
  createdBy: number;
}

/**
 * OEE (Overall Equipment Effectiveness) — Wave 2 module.
 *
 * Floor operators log daily OEE data per shift / line / machine.
 * Reports aggregate at section level (monthly) and group level.
 *
 * OEE = Availability × Performance × Quality
 *   Availability Rate = (Available Time - Shutdown Loss) / Available Time
 *   Performance Rate  = (Actual Cycle Time / Std Cycle Time) × (Net Production / Available Time)
 *   Quality Rate      = Net Production / (Net Production + Rejection + Rework)
 *
 * Tables:
 *   oee_request, oee_department, oee_section, oee_line, oee_machine,
 *   oee_group, oee_group_user, oee_phenomena, oee_phenomena_value,
 *   oee_model, oee_model_value, oee_monthly_groupwise_data,
 *   oee_monthly_sectionwise_data, oee_yearly_section_wise_data,
 *   oee_yearly_upload_data, oee_holiday, oee_skip_line,
 *   oee_loss_category, oee_loss_section, oee_bottleneck,
 *   oee_business_excellence, oee_mfg_coordinator
 */
@Injectable()
export class OeeService {
  // ── Master data ──────────────────────────────────────────────────────────────

  async getDepartments(plantId?: number) {
    const where: any = {};
    if (plantId) where.plantId = plantId;
    return OeeDepartment.findAll({ where, order: [['id', 'ASC']] });
  }

  async getSections(departmentId?: number) {
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    return OeeSection.findAll({ where, order: [['id', 'ASC']] });
  }

  async getLines(sectionId?: number) {
    const where: any = {};
    if (sectionId) where.sectionId = sectionId;
    return OeeLine.findAll({ where, order: [['id', 'ASC']] });
  }

  async getMachines(lineId?: number) {
    const where: any = {};
    if (lineId) where.lineId = lineId;
    return OeeMachine.findAll({ where, order: [['id', 'ASC']] });
  }

  async getGroups(sectionId?: number) {
    const where: any = {};
    if (sectionId) where.sectionId = sectionId;
    return OeeGroup.findAll({ where, order: [['id', 'ASC']] });
  }

  async getGroupsForUser(userId: number) {
    const memberships = await OeeGroupUser.findAll({
      where: { userId } as any,
      raw: true,
    });
    const groupIds = memberships.map((m: any) => m.groupId);
    if (!groupIds.length) return [];
    return OeeGroup.findAll({
      where: { id: { [Op.in]: groupIds } } as any,
    });
  }

  // ── OEE Requests ─────────────────────────────────────────────────────────────

  async listRequests(opts: {
    createdBy?: number;
    sectionId?: number;
    lineId?: number;
    requestDate?: string;
    from?: string;
    to?: string;
    all?: boolean;
  } = {}) {
    const where: any = { isDeleted: '0' };
    if (opts.sectionId) where.sectionId = opts.sectionId;
    if (opts.lineId) where.lineId = opts.lineId;
    if (opts.requestDate) where.requestDate = opts.requestDate;
    if (opts.from && opts.to) {
      where.requestDate = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.requestDate = { [Op.gte]: opts.from };
    }
    if (!opts.all && opts.createdBy) where.createdBy = opts.createdBy;
    return OeeRequest.findAll({
      where,
      order: [['requestDate', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  async getRequest(id: number) {
    const req = await OeeRequest.findByPk(id);
    if (!req) throw new NotFoundException('OEE request not found');
    return req;
  }

  async createRequest(dto: OeeRequestDto) {
    // Calculate OEE rates
    const avail = dto.availableTime > 0
      ? Math.max(0, (dto.availableTime - (dto.speedLoss ?? 0)) / dto.availableTime)
      : 0;
    const perf = dto.stdCycleTime > 0 && dto.availableTime > 0
      ? Math.min(1, (dto.actualCycleTime / dto.stdCycleTime) * (+dto.netProduction / dto.availableTime))
      : 0;
    const netProd = +dto.netProduction;
    const rej = +(dto.rejection ?? 0);
    const rew = +(dto.rework ?? 0);
    const qual = (netProd + rej + rew) > 0 ? netProd / (netProd + rej + rew) : 0;
    const oee = avail * perf * qual;

    return OeeRequest.create({
      plantId: dto.plantId,
      sectionId: dto.sectionId,
      lineId: dto.lineId,
      shift: dto.shift,
      groupId: dto.groupId,
      machineId: dto.machineId,
      requestDate: dto.requestDate,
      availableTime: dto.availableTime,
      stdCycleTime: dto.stdCycleTime,
      shutDownLoss: dto.shutDownLoss ?? '0',
      actualCycleTime: dto.actualCycleTime,
      remarks: dto.remarks ?? null,
      productionPlan: dto.productionPlan,
      productionActual: dto.productionActual,
      netProduction: dto.netProduction,
      oee: (oee * 100).toFixed(2),
      rejection: dto.rejection ?? '0',
      rework: dto.rework ?? 0,
      oeeWip: 0,
      speedLoss: dto.speedLoss ?? 0,
      rejectionLoss: dto.rejectionLoss ?? '0',
      reworkLoss: dto.reworkLoss ?? 0,
      identifiedLoss: dto.identifiedLoss ?? 0,
      undefinedLoss: dto.undefinedLoss ?? '0',
      totalLoss: dto.totalLoss ?? '0',
      createdBy: dto.createdBy,
      isDeleted: '0',
      createdAt: new Date(),
      ecNo: dto.ecNo ?? null,
      ecName: dto.ecName ?? '',
      availabilityRate: (avail * 100).toFixed(4),
      performanceRate: (perf * 100).toFixed(4),
      qualityRate: (qual * 100).toFixed(4),
      editCount: 0,
    } as any);
  }

  async updateRequest(id: number, dto: Partial<OeeRequestDto>) {
    const req = await OeeRequest.findByPk(id);
    if (!req) throw new NotFoundException('OEE request not found');
    const updated: any = { ...dto };
    // Recalculate if production values changed
    if (dto.netProduction || dto.rejection || dto.rework) {
      const netProd = +(dto.netProduction ?? (req as any).netProduction ?? 0);
      const rej = +(dto.rejection ?? (req as any).rejection ?? 0);
      const rew = +(dto.rework ?? (req as any).rework ?? 0);
      const qual = (netProd + rej + rew) > 0 ? netProd / (netProd + rej + rew) : 0;
      updated.qualityRate = (qual * 100).toFixed(4);
    }
    updated.editCount = ((req as any).editCount ?? 0) + 1;
    await req.update(updated);
    return req;
  }

  async deleteRequest(id: number) {
    const req = await OeeRequest.findByPk(id);
    if (!req) throw new NotFoundException('OEE request not found');
    await req.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Aggregated data ─────────────────────────────────────────────────────────

  async monthlyGroupData(groupId: number, year: number, month: number) {
    return OeeMonthlyGroupwiseData.findAll({
      where: { groupId, year, month } as any,
    });
  }

  async monthlySectionData(sectionId: number, year: number, month: number) {
    return OeeMonthlySectionwiseData.findAll({
      where: { sectionId, year, month } as any,
    });
  }

  // ── Phenomena / Model ────────────────────────────────────────────────────────

  async getPhenomenaForRequest(requestId: number) {
    return OeePhenomenaValue.findAll({
      where: { requestId } as any,
    });
  }

  async getModelForRequest(requestId: number) {
    return OeeModelValue.findAll({
      where: { requestId } as any,
    });
  }
}
