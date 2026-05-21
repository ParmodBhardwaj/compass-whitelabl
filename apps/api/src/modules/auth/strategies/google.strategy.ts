import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(cfg: ConfigService) {
    // passport-google-oauth20 throws if clientID is missing; provide a placeholder
    // so DI can complete in environments without Google OAuth configured. Routes
    // hit at runtime will surface the misconfig clearly.
    super({
      clientID: cfg.get<string>('GOOGLE_CLIENT_ID') || 'unconfigured',
      clientSecret: cfg.get<string>('GOOGLE_CLIENT_SECRET') || 'unconfigured',
      callbackURL: cfg.get<string>('GOOGLE_REDIRECT_URI') || 'http://localhost/oauth/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    return {
      id: 0,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      roles: [],
      source: 'google' as const,
    };
  }
}
