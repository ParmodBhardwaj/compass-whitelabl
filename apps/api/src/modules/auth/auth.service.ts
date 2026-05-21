import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface AuthUser {
  id: number;
  email: string;
  empCode?: string;
  roles?: string[];
  name?: string;
  source: 'ldap' | 'google' | 'local';
}

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService, private readonly cfg: ConfigService) {}

  issueTokens(user: AuthUser) {
    const payload = { sub: user.id, email: user.email, roles: user.roles ?? [], src: user.source, name: user.name ?? '' };
    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, {
        secret: this.cfg.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.cfg.get<string>('JWT_REFRESH_TTL', '7d'),
      }),
      user,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.cfg.get<string>('JWT_REFRESH_SECRET'),
      });
      return this.issueTokens({
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
        source: payload.src,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
