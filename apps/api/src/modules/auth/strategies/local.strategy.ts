import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Op, getDb, QueryTypes } from '@hero/db';
import { Employee } from '@hero/db/src/models/generated';
import bcrypt from 'bcryptjs';

/**
 * Local username/password strategy.
 *
 * Verifies against the legacy `employee` table:
 *   - lookup by email OR ecode OR username
 *   - bcrypt-compare against `employee.password` (legacy PHP `password_hash` $2y$ hashes
 *     are compatible with bcryptjs)
 *
 * Roles are read from `acl_user.role_id`. Resulting AuthUser is consumed by
 * AuthService.issueTokens(...) to produce JWT access + refresh tokens.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor() {
    super({ usernameField: 'username', passwordField: 'password' });
  }

  async validate(usernameOrEmail: string, password: string) {
    const u = (usernameOrEmail ?? '').trim();
    if (!u || !password) throw new UnauthorizedException('username and password required');

    const employee: any = await Employee.findOne({
      where: {
        [Op.or]: [{ email: u }, { ecode: u }, { username: u }],
      } as any,
    });
    if (!employee) throw new UnauthorizedException('invalid credentials');
    if (!employee.password) throw new UnauthorizedException('account has no password set');

    // Legacy hashes are $2y$ (PHP); bcryptjs accepts these directly.
    const ok = await bcrypt.compare(password, employee.password);
    if (!ok) throw new UnauthorizedException('invalid credentials');

    // acl_user has no `id` PK — use raw SQL to avoid Sequelize's implicit-id behavior.
    const aclRows = (await getDb().query<{ role_id: number }>(
      'SELECT role_id FROM acl_user WHERE user_id = :uid',
      { replacements: { uid: employee.userId }, type: QueryTypes.SELECT },
    )) as Array<{ role_id: number }>;
    const roles = aclRows.map((r) => r.role_id);

    return {
      id: employee.userId,
      email: employee.email,
      empCode: employee.ecode,
      name: employee.name,
      roles,
      source: 'local' as const,
    };
  }
}
