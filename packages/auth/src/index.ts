/**
 * Shared auth helpers reused by NestJS API and Next.js BFF.
 *
 * Legacy lmc-user passwords are bcrypt with a Laminas-flavored hash; bcryptjs
 * `compare()` works against them as long as the cost factor is supported.
 */
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

export async function verifyLegacyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signJwt(payload: object, secret: string, opts: SignOptions = {}): string {
  return jwt.sign(payload, secret, { algorithm: 'HS256', ...opts });
}

export function verifyJwt<T = any>(token: string, secret: string): T {
  return jwt.verify(token, secret) as T;
}
