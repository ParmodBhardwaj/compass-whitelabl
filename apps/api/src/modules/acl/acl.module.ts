import { Module } from '@nestjs/common';
import { AclService } from './acl.service';
import { AclGuard } from './acl.guard';
import { AclController } from './acl.controller';

/** Reads/writes existing acl_roles / acl_resources / acl_user / acl_category tables. */
@Module({
  controllers: [AclController],
  providers: [AclService, AclGuard],
  exports: [AclService, AclGuard],
})
export class AclModule {}
