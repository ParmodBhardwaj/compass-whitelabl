import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Op, getDb, QueryTypes } from '@hero/db';
import {
  AclRoles,
  AclCategory,
  AclUser,
  AclResources,
  AclStoreRoles,
  AclStores,
} from '@hero/db/src/models/generated';

/**
 * ACL service — Role management API.
 * Hot-reload trigger: composite-PK fix on acl_user / acl_store_roles models.
 *
 * Replicates the legacy ManageAcl module:
 *   acl_roles        — role catalog (id, name, role_category FK, is_fixed, store_id)
 *   acl_category     — role categories (id, category_name)
 *   acl_user         — user→role assignments (user_id, role_id) [composite PK]
 *   acl_resources    — role→route/action permissions (resource_id, role_id, route_name, action, type)
 *   acl_store_roles  — role→store visibility (role_id, store_id) [composite PK]
 *
 * Conventions:
 *   - role_id = 9 is "Super Admin" (the only global admin role; protected from delete).
 *   - is_fixed = '1' marks roles that ship with the system and shouldn't be deleted.
 *   - store_id = 1 is the main "Hero MotoCorp" store; multi-store can come later.
 */
@Injectable()
export class AclService {
  // ── User-facing permission checks (used by AclGuard) ─────────────────────

  async userHasResource(_userId: number, _resourceKey: string): Promise<boolean> {
    return true;
  }

  async rolesForUser(userId: number): Promise<number[]> {
    const rows = (await getDb().query<{ role_id: number }>(
      'SELECT role_id FROM acl_user WHERE user_id = :uid',
      { replacements: { uid: userId }, type: QueryTypes.SELECT },
    )) as Array<{ role_id: number }>;
    return rows.map((r) => r.role_id);
  }

  // ── Stores (Portals) ─────────────────────────────────────────────────────

  /**
   * Every store in the system. Used by Super Admin views that need the full
   * catalog (e.g. role → store mapping picker).
   */
  async listAllStores() {
    return AclStores.findAll({ order: [['storeId', 'ASC']] });
  }

  /**
   * Stores the given user has admin access to, via their role assignments:
   *   acl_user → acl_store_roles → acl_stores
   *
   * Super-admin shortcut: user_id === 1 OR has role_id 9 → sees every store.
   * This mirrors the legacy "Select Portal" dropdown in /admin/dashboard,
   * which lists only stores the logged-in user is authorized to manage.
   */
  async listStoresForUser(userId: number): Promise<Array<{
    storeId: number; name: string; alias?: string; frontendUrl?: string;
  }>> {
    // Find the user's role IDs.
    const roleRows = (await getDb().query<{ role_id: number }>(
      'SELECT role_id FROM acl_user WHERE user_id = :uid',
      { replacements: { uid: userId }, type: QueryTypes.SELECT },
    )) as Array<{ role_id: number }>;
    const roleIds = roleRows.map((r) => r.role_id);
    const isSuperAdmin = userId === 1 || roleIds.includes(9);

    if (isSuperAdmin) {
      // Super-admin sees every store.
      const all = await AclStores.findAll({ order: [['storeId', 'ASC']], raw: true });
      return (all as any[]).map((s) => ({
        storeId: s.storeId,
        name: s.name,
        alias: s.alias,
        frontendUrl: s.frontendUrl,
      }));
    }

    if (roleIds.length === 0) return [];

    // Otherwise: stores reachable through this user's roles via acl_store_roles.
    const rows = (await getDb().query(
      `SELECT s.store_id AS storeId,
              s.name     AS name,
              s.alias    AS alias,
              s.frontend_url AS frontendUrl
         FROM acl_stores s
         JOIN acl_store_roles sr ON sr.store_id = s.store_id
        WHERE sr.role_id IN (:roleIds)
        GROUP BY s.store_id, s.name, s.alias, s.frontend_url
        ORDER BY s.store_id ASC`,
      { replacements: { roleIds }, type: QueryTypes.SELECT },
    )) as Array<{ storeId: number; name: string; alias?: string; frontendUrl?: string }>;
    return rows;
  }

  // ── Categories ──────────────────────────────────────────────────────────

  async listCategories() {
    return AclCategory.findAll({ order: [['id', 'ASC']] });
  }

  async createCategory(dto: { categoryName: string }) {
    return AclCategory.create({ categoryName: dto.categoryName } as any);
  }

  async updateCategory(id: number, dto: { categoryName: string }) {
    const row = await AclCategory.findByPk(id);
    if (!row) throw new NotFoundException('Category not found');
    await row.update({ categoryName: dto.categoryName } as any);
    return row;
  }

  async deleteCategory(id: number) {
    const row = await AclCategory.findByPk(id);
    if (!row) throw new NotFoundException('Category not found');
    // Don't allow delete if there are roles using this category.
    const usingCount = await AclRoles.count({ where: { roleCategory: id } as any });
    if (usingCount > 0) {
      throw new ForbiddenException(`Category in use by ${usingCount} role(s); reassign them first.`);
    }
    await row.destroy();
    return { id, deleted: true };
  }

  // ── Roles ───────────────────────────────────────────────────────────────

  async listRoles(opts: { categoryId?: number; storeId?: number; q?: string } = {}) {
    const where: any = {};
    if (opts.categoryId) where.roleCategory = opts.categoryId;
    if (opts.storeId) where.storeId = opts.storeId;
    if (opts.q) where.name = { [Op.like]: `%${opts.q}%` };
    const roles = await AclRoles.findAll({ where, order: [['roleId', 'ASC']] });
    // Decorate with member-count (how many users hold each role)
    const ids = roles.map((r: any) => r.roleId);
    if (ids.length === 0) return roles;
    const counts = (await getDb().query<{ role_id: number; cnt: number }>(
      'SELECT role_id, COUNT(*) AS cnt FROM acl_user WHERE role_id IN (:ids) GROUP BY role_id',
      { replacements: { ids }, type: QueryTypes.SELECT },
    )) as Array<{ role_id: number; cnt: number }>;
    const byRole = new Map(counts.map((c) => [c.role_id, Number(c.cnt)]));
    return roles.map((r: any) => ({
      ...r.toJSON(),
      memberCount: byRole.get(r.roleId) ?? 0,
    }));
  }

  async getRole(roleId: number) {
    const role = await AclRoles.findByPk(roleId);
    if (!role) throw new NotFoundException('Role not found');
    // Pull resources + assigned stores + member user IDs.
    const [resources, storeRows, userRows] = await Promise.all([
      AclResources.findAll({ where: { roleId } as any, order: [['routeName', 'ASC']] }),
      AclStoreRoles.findAll({ where: { roleId } as any }),
      AclUser.findAll({ where: { roleId } as any }),
    ]);
    return {
      role,
      resources,
      storeIds: (storeRows as any[]).map((s) => s.storeId),
      userIds: (userRows as any[]).map((u) => u.userId),
    };
  }

  async createRole(dto: {
    name: string;
    roleCategory?: number;
    isFixed?: '0' | '1';
    storeId?: number;
  }) {
    // acl_roles.role_category is NOT NULL (no default) — coerce empty/null to 0
    // so role creation works when no category is picked.
    return AclRoles.create({
      name: dto.name,
      roleCategory: dto.roleCategory ?? 0,
      isFixed: dto.isFixed ?? '0',
      storeId: dto.storeId ?? 1,
    } as any);
  }

  async updateRole(
    roleId: number,
    dto: Partial<{ name: string; roleCategory: number; isFixed: '0' | '1'; storeId: number }>,
  ) {
    const role = await AclRoles.findByPk(roleId);
    if (!role) throw new NotFoundException('Role not found');
    await role.update(dto as any);
    return role;
  }

  async deleteRole(roleId: number) {
    const role = await AclRoles.findByPk(roleId);
    if (!role) throw new NotFoundException('Role not found');
    if ((role as any).isFixed === '1') {
      throw new ForbiddenException('Fixed roles cannot be deleted');
    }
    if (roleId === 9) {
      throw new ForbiddenException('Super Admin role is protected from deletion');
    }
    // Cascade: remove user→role and role→store mappings, then resources.
    await Promise.all([
      AclUser.destroy({ where: { roleId } as any }),
      AclStoreRoles.destroy({ where: { roleId } as any }),
      AclResources.destroy({ where: { roleId } as any }),
    ]);
    await role.destroy();
    return { roleId, deleted: true };
  }

  // ── Role members (acl_user) ─────────────────────────────────────────────

  /** Return all users currently assigned the given role, with employee details. */
  async listRoleMembers(roleId: number) {
    const rows = (await getDb().query(
      `SELECT u.user_id   AS userId,
              e.ecode     AS ecode,
              e.name      AS name,
              e.email     AS email,
              e.designation AS designation
         FROM acl_user u
         LEFT JOIN employee e ON e.user_id = u.user_id
        WHERE u.role_id = :rid
        ORDER BY e.name ASC`,
      { replacements: { rid: roleId }, type: QueryTypes.SELECT },
    )) as Array<{
      userId: number; ecode?: string; name?: string; email?: string; designation?: string;
    }>;
    return rows;
  }

  async addRoleMember(roleId: number, userId: number) {
    // acl_user has composite PK (user_id, role_id) — insert is idempotent.
    const exists = await AclUser.findOne({ where: { userId, roleId } as any });
    if (exists) return { roleId, userId, added: false };
    await AclUser.create({ userId, roleId } as any);
    return { roleId, userId, added: true };
  }

  async removeRoleMember(roleId: number, userId: number) {
    const n = await AclUser.destroy({ where: { userId, roleId } as any });
    return { roleId, userId, removed: n > 0 };
  }

  /** Replace the full member list for a role in one call. */
  async setRoleMembers(roleId: number, userIds: number[]) {
    await AclUser.destroy({ where: { roleId } as any });
    if (userIds.length > 0) {
      await AclUser.bulkCreate(userIds.map((u) => ({ userId: u, roleId })) as any[]);
    }
    return { roleId, count: userIds.length };
  }

  // ── Resources (role → route/action permissions) ─────────────────────────

  async listResources(roleId: number) {
    return AclResources.findAll({
      where: { roleId } as any,
      order: [['routeName', 'ASC'], ['action', 'ASC']],
    });
  }

  async addResource(dto: {
    roleId: number;
    routeName: string;
    action: string;
    type?: '0' | '1';
  }) {
    return AclResources.create({
      roleId: dto.roleId,
      routeName: dto.routeName,
      action: dto.action,
      type: dto.type ?? '0',
    } as any);
  }

  async deleteResource(resourceId: number) {
    const n = await AclResources.destroy({ where: { resourceId } as any });
    return { resourceId, removed: n > 0 };
  }

  /** Bulk replace resources for a role. */
  async setRoleResources(
    roleId: number,
    resources: Array<{ routeName: string; action: string; type?: '0' | '1' }>,
  ) {
    await AclResources.destroy({ where: { roleId } as any });
    if (resources.length > 0) {
      await AclResources.bulkCreate(
        resources.map((r) => ({
          roleId,
          routeName: r.routeName,
          action: r.action,
          type: r.type ?? '0',
        })) as any[],
      );
    }
    return { roleId, count: resources.length };
  }
}
