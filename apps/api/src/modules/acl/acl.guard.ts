import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AclService } from './acl.service';

export const RESOURCE_KEY = 'acl:resource';
export const RequireResource = (key: string) => SetMetadata(RESOURCE_KEY, key);

@Injectable()
export class AclGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly acl: AclService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<string>(RESOURCE_KEY, ctx.getHandler());
    if (!resource) return true;
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;
    return this.acl.userHasResource(user.id, resource);
  }
}
