import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InsuranceService } from './insurance.service';

@Controller('insurance')
@UseGuards(AuthGuard('jwt'))
export class InsuranceController {
  constructor(private readonly svc: InsuranceService) {}

  // ── Dashboard & Sections ──────────────────────────────────────────────────

  /** Sectioned landing payload — every section + its top hyperlinks/documents + FAQs. */
  @Get('dashboard')
  dashboard() {
    return this.svc.getDashboard();
  }

  @Get('sections')
  listSections() {
    return this.svc.listSections();
  }

  @Get('sections/:id')
  getSection(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getSection(id);
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  @Get('documents')
  listDocuments(
    @Query('sectionId') sectionId?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listDocuments(sectionId ? +sectionId : undefined, all === '1');
  }

  @Get('documents/:id')
  getDocument(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getDocument(id);
  }

  @Post('documents')
  createDocument(@Body() body: {
    title: string;
    documentName?: string;
    documentType?: string;
    sectionId?: number;
    status?: string;
  }) {
    return this.svc.createDocument(body);
  }

  @Put('documents/:id')
  updateDocument(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateDocument(id, body);
  }

  @Delete('documents/:id')
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteDocument(id);
  }

  // ── FAQs ──────────────────────────────────────────────────────────────────

  @Get('faqs')
  listFaqs(@Query('all') all?: string) {
    return this.svc.listFaqs(all === '1');
  }

  @Post('faqs')
  createFaq(@Body() body: { question: string; answer: string; status?: string }) {
    return this.svc.createFaq(body);
  }

  @Put('faqs/:id')
  updateFaq(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ question: string; answer: string; status: string }>,
  ) {
    return this.svc.updateFaq(id, body);
  }

  @Delete('faqs/:id')
  deleteFaq(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteFaq(id);
  }

  // ── Hyperlinks ────────────────────────────────────────────────────────────

  @Get('hyperlinks')
  listHyperlinks(
    @Query('sectionId') sectionId?: string,
    @Query('all') all?: string,
  ) {
    return this.svc.listHyperlinks(sectionId ? +sectionId : undefined, all === '1');
  }

  @Post('hyperlinks')
  createHyperlink(@Body() body: any) {
    return this.svc.createHyperlink(body);
  }

  @Put('hyperlinks/:id')
  updateHyperlink(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateHyperlink(id, body);
  }

  @Delete('hyperlinks/:id')
  deleteHyperlink(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteHyperlink(id);
  }
}
