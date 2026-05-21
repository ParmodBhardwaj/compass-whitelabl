import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

class LoginDto {
  username!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * Username/password login.
   *
   * Default = LOCAL strategy: verifies against the legacy `employee` table
   * (bcrypt $2y$ hashes from PHP password_hash are accepted).
   *
   * Use the same email + password the user uses on the legacy PHP portal.
   * `username` field accepts: email, ecode, or username column.
   */
  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: any, @Body() _body: LoginDto) {
    return this.auth.issueTokens(req.user);
  }

  /** Optional LDAP login — only works if LDAP_* env vars point at a live LDAP/AD server. */
  @Post('login/ldap')
  @UseGuards(AuthGuard('ldap'))
  async ldapLogin(@Req() req: any, @Body() _body: LoginDto) {
    return this.auth.issueTokens(req.user);
  }

  /** Google OAuth start. */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  google() {
    /* redirect handled by passport */
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any) {
    return this.auth.issueTokens(req.user);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') token: string) {
    return this.auth.refresh(token);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: any) {
    return req.user;
  }
}
