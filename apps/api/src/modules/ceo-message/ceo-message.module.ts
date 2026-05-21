import { Module } from '@nestjs/common';
import { CeoMessageController } from './ceo-message.controller';
import { CeoMessageService } from './ceo-message.service';

/**
 * CEO Message — Wave 1 module.
 *
 * Displays CEO and leadership messages to employees.
 * Admin posts messages with an optional hero image.
 *
 * Table: message
 */
@Module({
  controllers: [CeoMessageController],
  providers: [CeoMessageService],
  exports: [CeoMessageService],
})
export class CeoMessageModule {}
