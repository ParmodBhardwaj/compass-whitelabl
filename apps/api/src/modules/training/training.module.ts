import { Module } from '@nestjs/common';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

/**
 * Training — Wave 3 module.
 * Employees log training records and view champions/ambassadors.
 * Tables: training_score, training_champions_ambassadors, training_pillar_campaigns
 */
@Module({
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
