import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LdapStrategyImpl = require('passport-ldapauth').Strategy;

@Injectable()
export class LdapStrategy extends PassportStrategy(LdapStrategyImpl, 'ldap') {
  constructor(cfg: ConfigService) {
    super({
      server: {
        url: cfg.get<string>('LDAP_URL') ?? '',
        bindDN: cfg.get<string>('LDAP_BIND_DN') ?? '',
        bindCredentials: cfg.get<string>('LDAP_BIND_PASSWORD') ?? '',
        searchBase: cfg.get<string>('LDAP_SEARCH_BASE') ?? '',
        searchFilter: '(sAMAccountName={{username}})',
      },
    });
  }

  async validate(ldapUser: any) {
    return {
      id: 0,
      email: ldapUser.mail,
      empCode: ldapUser.sAMAccountName,
      name: ldapUser.displayName,
      roles: [],
      source: 'ldap' as const,
    };
  }
}
