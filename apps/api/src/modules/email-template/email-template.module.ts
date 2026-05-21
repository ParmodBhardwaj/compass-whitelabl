import { Module } from '@nestjs/common';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';

/**
 * Email Template admin module — replaces legacy
 * `Miscellaneous\Controller\EmailTemplateController`. Manages the
 * `email_template` table (the catalogue of notification email bodies
 * referenced by TPM, Injury, Activity Tracker etc. mail jobs).
 */
@Module({
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService],
  exports: [EmailTemplateService],
})
export class EmailTemplateModule {}
