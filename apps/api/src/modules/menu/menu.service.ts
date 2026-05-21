import { Injectable, NotFoundException } from '@nestjs/common';
import { Op, getDb, QueryTypes } from '@hero/db';
import { Menu, StoreModules } from '@hero/db/src/models/generated';

export interface MenuDto {
  parentId?: number;
  module?: number | null;
  url?: string;
  menuName: string;
  tagName?: string;
  menuType: '0' | '1'; // 0 = internal, 1 = external
  class?: string;
  roleId?: number | null;
  dealerRole?: number | null;
  ordering?: number;
  position: '0' | '1' | '2'; // 0 = header, 1 = sidebar, 2 = footer
  store: number;
  appName?: string;
  allowGuest?: '0' | '1';
  newWindow?: '0' | '1';
  active?: '0' | '1';
}

/**
 * `position` enum:
 *   '0' = header
 *   '1' = sidebar
 *   '2' = footer
 *
 * Visibility rules (matching legacy `Menu\Helper\MenuHelper::getSidebarMenusTree`):
 *   1. `active = '1'`
 *   2. `store` matches current store
 *   3. `position` matches requested ('0' header, '1' sidebar, '2' footer)
 *   4. EITHER `allow_guest = '1'` (public for everyone)
 *      OR `role_id` is NULL/0 (no role restriction)
 *      OR user holds the role (`roleIds.includes(role_id)`)
 *      OR user is super-admin (`userId === 1`)
 *
 * Tree is built in-memory from `parent_id` after role filtering.
 */
@Injectable()
export class MenuService {
  async getTree(opts: {
    storeId: number;
    position: '0' | '1' | '2';
    roleIds?: number[];
    userId?: number;
  }) {
    const { storeId, position, roleIds = [], userId } = opts;
    const all = await Menu.findAll({
      where: { store: storeId, position, active: '1' } as any,
      order: [['ordering', 'ASC']],
      raw: true,
    });
    const isAdmin = userId === 1;
    const visible = all.filter((m: any) => {
      if (isAdmin) return true;
      if (m.allowGuest === '1' || m.allowGuest === 1) return true;
      if (!m.roleId || m.roleId === 0) return true;
      return roleIds.includes(m.roleId);
    });
    return buildTree(visible as any[]);
  }

  async listFlat(opts: { storeId?: number; position?: '0' | '1' | '2' }) {
    const where: any = {};
    if (opts.storeId !== undefined) where.store = opts.storeId;
    if (opts.position) where.position = opts.position;
    return Menu.findAll({ where, order: [['position', 'ASC'], ['ordering', 'ASC']] });
  }

  async create(dto: MenuDto) {
    return Menu.create({
      parentId: dto.parentId ?? 0,
      module: dto.module ?? null,
      url: dto.url ?? '',
      menuName: dto.menuName,
      tagName: dto.tagName ?? '',
      menuType: dto.menuType,
      class: dto.class ?? '',
      roleId: dto.roleId ?? null,
      dealerRole: dto.dealerRole ?? null,
      ordering: dto.ordering ?? 0,
      position: dto.position,
      store: dto.store,
      appName: dto.appName ?? null,
      allowGuest: dto.allowGuest ?? '0',
      newWindow: dto.newWindow ?? '0',
      active: dto.active ?? '1',
    } as any);
  }

  async update(id: number, dto: Partial<MenuDto>) {
    const row = await Menu.findByPk(id);
    if (!row) throw new NotFoundException();
    await row.update(dto as any);
    return row;
  }

  /**
   * Admin navigation tree for a given portal (store), filtered by the caller's
   * ACL permissions.
   *
   * Mirrors the legacy `Menu\Helper\MenuHelper::getNavigationMenus()`:
   *   1. Fetch all `store_modules` rows for the requested store.
   *   2. For each row:
   *        • `route_name = '#'` (category opener) → always allowed
   *        • else allowed only if the user holds at least one role with a
   *          matching `acl_resources` row (`route_name = m.route_name`).
   *   3. Drop orphans (children whose parent was filtered out).
   *   4. Super-admin shortcut (user_id === 1 or role_id 9 present) skips the
   *      ACL filter entirely.
   */
  async getAdminNavigation(storeId: number, userId?: number, roleIds: number[] = []) {
    const isSuperAdmin = userId === 1 || roleIds.includes(9);

    const rows = (await StoreModules.findAll({
      where: { storeId } as any,
      order: [['ordering', 'ASC']],
      raw: true,
    })) as any[];

    if (isSuperAdmin || roleIds.length === 0 && userId === 1) {
      return buildTree(rows);
    }

    // Build the allow-set of route_names from acl_resources for this user's roles.
    let allowedRoutes: Set<string> = new Set();
    if (roleIds.length > 0) {
      const resourceRows = (await getDb().query<{ route_name: string }>(
        'SELECT DISTINCT route_name FROM acl_resources WHERE role_id IN (:rids)',
        { replacements: { rids: roleIds }, type: QueryTypes.SELECT },
      )) as Array<{ route_name: string }>;
      allowedRoutes = new Set(resourceRows.map(r => r.route_name));
    }

    const filtered = rows.filter((m) => {
      const route = (m.routeName ?? m.route_name ?? '') as string;
      if (!route || route === '#') return true;          // category opener
      return allowedRoutes.has(route);
    });

    return buildTree(filtered);
  }

  async remove(id: number) {
    const row = await Menu.findByPk(id);
    if (!row) throw new NotFoundException();
    // Soft delete by re-parenting children to root, then destroying.
    await Menu.update({ parentId: 0 } as any, { where: { parentId: id } as any });
    await row.destroy();
    return { id, deleted: true };
  }

  async reorder(updates: Array<{ id: number; ordering: number; parentId?: number }>) {
    for (const u of updates) {
      const set: any = { ordering: u.ordering };
      if (u.parentId !== undefined) set.parentId = u.parentId;
      await Menu.update(set, { where: { id: u.id } as any });
    }
    return { ok: true, count: updates.length };
  }
}

/**
 * Build a hierarchical tree from a flat list of menu rows.
 *
 * Rules:
 *   - A node becomes a root only if its `parentId` is 0/null (true top-level).
 *   - A node with a parentId pointing to a row that IS in the filtered list
 *     attaches as a child of that row.
 *   - A node with a parentId pointing to a row that ISN'T in the list
 *     (e.g. parent is inactive, hidden by role, or wrong position) is DROPPED,
 *     not promoted to root. This prevents orphan leakage into the navigation.
 */
function buildTree(items: any[]) {
  const byId = new Map<number, any>();
  for (const it of items) byId.set(it.id, { ...it, children: [] });
  const roots: any[] = [];
  for (const node of byId.values()) {
    // raw:true returns camelCase attribute names (parentId, not parent_id)
    const pid = node.parentId ?? node.parent_id;
    if (!pid || pid === 0) {
      roots.push(node);
    } else if (byId.has(pid)) {
      byId.get(pid).children.push(node);
    }
    // else: orphan — parent was filtered out; skip this node entirely.
  }
  return roots;
}
