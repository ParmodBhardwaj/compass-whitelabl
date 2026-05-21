import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CeoMessageService } from './ceo-message.service';

@Controller('ceo-message')
@UseGuards(AuthGuard('jwt'))
export class CeoMessageController {
  constructor(private readonly svc: CeoMessageService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Get('latest')
  getLatest() {
    return this.svc.getLatest();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getById(id);
  }

  @Post()
  create(@Body() body: { title: string; description?: string; image?: string }) {
    return this.svc.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ title: string; description: string; image: string }>,
  ) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.svc.delete(id);
  }
}
