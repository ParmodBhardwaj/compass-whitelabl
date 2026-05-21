import { Injectable } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  SopProcess,
  SopProcedures,
  SopSections,
  SopLevel1,
  SopLevel4Files,
  SopActivityTracker,
} from '@hero/db/src/models/generated';

export type SopActivityKind =
  | 'view_undertaking'
  | 'view_listing'
  | 'view_level1'
  | 'view_level2'
  | 'view_level3'
  | 'download_level4';

@Injectable()
export class SopService {
  async sections() {
    return SopSections.findAll({ where: { status: '1' } as any, order: [['sortOrder', 'ASC']] });
  }

  async listProcesses(opts: { sectionId?: number; q?: string }) {
    const where: any = { isDeleted: { [Op.or]: [null, '0'] } };
    if (opts.sectionId) where.sectionId = opts.sectionId;
    if (opts.q) where.title = { [Op.like]: `%${opts.q}%` };
    return SopProcess.findAll({ where, order: [['sortOrder', 'ASC']] });
  }

  async detail(processId: number) {
    const process = await SopProcess.findByPk(processId);
    if (!process) return null;
    const procedures = await SopProcedures.findAll({
      where: { processId } as any,
      order: [['fromDate', 'DESC']],
    });
    const level1 = await SopLevel1.findAll();
    return { process, procedures, level1 };
  }

  async procedureFiles(procedureId: number) {
    return SopLevel4Files.findAll({ where: { procedureId } as any });
  }

  async logActivity(userId: number, kind: SopActivityKind, detail: string) {
    await SopActivityTracker.create({
      userId,
      activityDescription: `[${kind}] ${detail}`,
      activityDate: new Date(),
    } as any);
  }
}
