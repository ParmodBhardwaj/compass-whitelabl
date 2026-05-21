import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok', service: 'hero-compass-api', ts: new Date().toISOString() };
  }
}
