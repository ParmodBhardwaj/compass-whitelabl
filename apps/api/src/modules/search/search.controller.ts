import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(AuthGuard('jwt'))
export class SearchController {
  constructor(private readonly svc: SearchService) {}

  @Get()
  search(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.svc.search(q, limit ? Number(limit) : 10);
  }

  /** Typeahead dropdown — returns { employees[], applications[] } two-column data. */
  @Get('quick')
  quick(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.svc.quick(q, limit ? Number(limit) : 8);
  }
}
