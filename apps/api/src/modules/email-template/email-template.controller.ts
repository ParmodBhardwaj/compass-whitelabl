import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmailTemplateService } from './email-template.service';

@Controller('email-templates')
@UseGuards(AuthGuard('jwt'))
export class EmailTemplateController {
  constructor(private readonly svc: EmailTemplateService) {}

  @Get()
  list(@Query('q') q?: string, @Query('all') all?: string) {
    return this.svc.list({ q, includeDeleted: all === '1' });
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.get(id);
  }

  @Post()
  create(@Body() body: {
    name: string; alias?: string; subject: string; message: string; status?: '0' | '1';
  }) {
    return this.svc.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
