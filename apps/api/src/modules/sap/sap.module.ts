import { Module } from '@nestjs/common';
import { SapController } from './sap.controller';
import { SapService } from './sap.service';

/**
 * SAP Integration — Wave 4 module.
 * Wraps the SOAP client from @hero/integrations.
 * Requires env vars: SAP_WSDL_URL, SAP_USERNAME, SAP_PASSWORD.
 * If SAP_WSDL_URL is absent the service starts in degraded mode —
 * all endpoints return 503 ServiceUnavailable.
 */
@Module({
  controllers: [SapController],
  providers: [SapService],
  exports: [SapService],
})
export class SapModule {}
