import { Module } from '@nestjs/common';
import { TpmVisitorDataController } from './tpm-visitor-data.controller';
import { TpmVisitorDataService } from './tpm-visitor-data.service';

/**
 * TPM + Visitor master-data admin module.
 *
 * Owns ~26 master tables across the TPM (hazard, injury, kaizen, ks)
 * and Visitor portals. Routes are mounted under /tpm-master/* and
 * /visitor-master/* to avoid colliding with the portal-facing workflow
 * controllers (/tpm/hazards, /visitors/passes, etc.).
 */
@Module({
  controllers: [TpmVisitorDataController],
  providers: [TpmVisitorDataService],
  exports: [TpmVisitorDataService],
})
export class TpmVisitorDataModule {}
