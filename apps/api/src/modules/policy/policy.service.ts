import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from '@hero/db';
import {
  HeroPolicy,
  HeroPolicyAdminUser,
  HeroPolicyLogs,
  HeroPolicyRoles,
  HeroPolicySection,
} from '@hero/db/src/models/generated';

export interface PolicyDto {
  roleId?: number | null;
  title?: string;
  alias?: string;
  fromDate?: string;
  isPublic?: '0' | '1';
  shortDescription?: string;
  description?: string;
  metaKeywords?: string;
  metaTitle?: string;
  metaDescription?: string;
  status?: '0' | '1';
}

export interface PolicySectionDto {
  policyId: number;
  title?: string;
  description?: string;
  sectionNo?: string;
  isActive?: '0' | '1';
}

/**
 * Policy visibility:
 *   - is_public='1' → visible to everyone
 *   - else → user must have at least one role in hero_policy_roles for that policy
 */
@Injectable()
export class PolicyService {
  async list(roleIds: number[]) {
    const all = (await HeroPolicy.findAll({
      where: { status: '1' } as any,
      order: [['fromDate', 'DESC']],
      raw: true,
    })) as any[];
    if (roleIds.length === 0) return all.filter((p) => p.is_public === '1');
    const roleRows = (await HeroPolicyRoles.findAll({
      where: { roleId: { [Op.in]: roleIds } } as any,
      raw: true,
    })) as any[];
    const allowedIds = new Set(roleRows.map((r) => r.policy_id));
    return all.filter((p) => p.is_public === '1' || allowedIds.has(p.id));
  }

  async detail(id: number, roleIds: number[]) {
    const policy = (await HeroPolicy.findByPk(id, { raw: true })) as any;
    if (!policy || policy.status !== '1') return null;
    if (policy.is_public !== '1') {
      const role = await HeroPolicyRoles.findOne({
        where: { policyId: id, roleId: { [Op.in]: roleIds } } as any,
      });
      if (!role) return null;
    }
    const sections = await HeroPolicySection.findAll({
      where: { policyId: id, isActive: '1' } as any,
      order: [['sectionNo', 'ASC']],
    });
    return { policy, sections };
  }

  async listAdmin() {
    return HeroPolicy.findAll({ order: [['fromDate', 'DESC']] });
  }

  async create(dto: PolicyDto) {
    return HeroPolicy.create({
      roleId: dto.roleId ?? null,
      title: dto.title,
      alias: dto.alias ?? slug(dto.title ?? ''),
      fromDate: dto.fromDate ?? null,
      isPublic: dto.isPublic ?? '0',
      shortDescription: dto.shortDescription,
      description: dto.description,
      metaKeywords: dto.metaKeywords,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      status: dto.status ?? '0',
    } as any);
  }

  async update(id: number, userId: number, dto: Partial<PolicyDto>) {
    const row = await HeroPolicy.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update(dto as any);
    await HeroPolicyLogs.create({
      policyId: id,
      editedBy: userId,
      title: (row as any).title,
      modifyDate: new Date(),
      sectionNo: '',
      description: JSON.stringify(dto),
    } as any);
    return row;
  }

  async remove(id: number) {
    const row = await HeroPolicy.findByPk(id);
    if (!row) throw new NotFoundException();
    await HeroPolicySection.destroy({ where: { policyId: id } as any });
    await HeroPolicyAdminUser.destroy({ where: { policyId: id } as any });
    await HeroPolicyRoles.destroy({ where: { policyId: id } as any });
    await row.destroy();
    return { id, deleted: true };
  }

  // ---- sections ----
  async sections(policyId: number) {
    return HeroPolicySection.findAll({
      where: { policyId } as any,
      order: [['sectionNo', 'ASC']],
    });
  }

  async createSection(dto: PolicySectionDto, userId: number) {
    const sec = await HeroPolicySection.create({
      policyId: dto.policyId,
      title: dto.title,
      description: dto.description,
      sectionNo: dto.sectionNo,
      isActive: dto.isActive ?? '1',
    } as any);
    await HeroPolicyLogs.create({
      policyId: dto.policyId,
      editedBy: userId,
      title: dto.title ?? '',
      modifyDate: new Date(),
      sectionNo: dto.sectionNo ?? '',
      description: dto.description ?? '',
    } as any);
    return sec;
  }

  async updateSection(id: number, dto: Partial<PolicySectionDto>, userId: number) {
    const sec = await HeroPolicySection.findByPk(id);
    if (!sec) throw new NotFoundException();
    await sec.update(dto as any);
    await HeroPolicyLogs.create({
      policyId: (sec as any).policyId,
      editedBy: userId,
      title: dto.title ?? (sec as any).title,
      modifyDate: new Date(),
      sectionNo: dto.sectionNo ?? (sec as any).sectionNo,
      description: dto.description ?? (sec as any).description,
    } as any);
    return sec;
  }

  async deleteSection(id: number) {
    const sec = await HeroPolicySection.findByPk(id);
    if (!sec) throw new NotFoundException();
    await sec.destroy();
    return { id, deleted: true };
  }

  // ---- admin users for a policy ----
  async adminUsers(policyId: number) {
    return HeroPolicyAdminUser.findAll({ where: { policyId } as any });
  }
  async setAdminUsers(policyId: number, userIds: number[]) {
    await HeroPolicyAdminUser.destroy({ where: { policyId } as any });
    if (userIds.length === 0) return [];
    return HeroPolicyAdminUser.bulkCreate(userIds.map((u) => ({ policyId, userId: u })) as any);
  }

  // ---- role assignment ----
  async assignRoles(policyId: number, roleIds: number[]) {
    await HeroPolicyRoles.destroy({ where: { policyId } as any });
    if (roleIds.length === 0) return [];
    return HeroPolicyRoles.bulkCreate(roleIds.map((r) => ({ policyId, roleId: r })) as any);
  }

  async logs(policyId: number) {
    return HeroPolicyLogs.findAll({
      where: { policyId } as any,
      order: [['modifyDate', 'DESC']],
      limit: 100,
    });
  }
}

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 255);
}
