import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TaxDocuments,
  TaxFaqs,
  TaxHyperlinks,
  Section,
} from '@hero/db/src/models/generated';

/**
 * Tax Insight — Wave 3 module.
 *
 * Provides tax documents, FAQs, and hyperlinks to employees.
 * Read-heavy portal; admin manages content.
 *
 * Tables: tax_documents, tax_faqs, tax_hyperlinks
 */
@Injectable()
export class TaxService {
  // ── Documents ────────────────────────────────────────────────────────────────

  async listDocuments(sectionId?: number, adminAll = false) {
    const where: any = adminAll ? { isDeleted: '0' } : { isDeleted: '0', status: '1' };
    if (sectionId) where.sectionId = sectionId;
    return TaxDocuments.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async getDocument(id: number) {
    const doc = await TaxDocuments.findByPk(id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async createDocument(dto: {
    title: string;
    documentName?: string;
    documentType?: string;
    sectionId?: number;
    status?: string;
  }) {
    return TaxDocuments.create({
      title: dto.title,
      documentName: dto.documentName ?? null,
      documentType: dto.documentType ?? null,
      sectionId: dto.sectionId ?? null,
      status: dto.status ?? '1',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }

  async updateDocument(id: number, dto: Partial<{
    title: string;
    documentName: string;
    documentType: string;
    sectionId: number;
    status: string;
  }>) {
    const doc = await TaxDocuments.findByPk(id);
    if (!doc) throw new NotFoundException('Document not found');
    await doc.update(dto as any);
    return doc;
  }

  async deleteDocument(id: number) {
    const doc = await TaxDocuments.findByPk(id);
    if (!doc) throw new NotFoundException('Document not found');
    await doc.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── FAQs ─────────────────────────────────────────────────────────────────────

  async listFaqs(adminAll = false) {
    const where: any = adminAll ? { isDeleted: '0' } : { isDeleted: '0', status: '1' };
    return TaxFaqs.findAll({ where, order: [['id', 'ASC']] });
  }

  async createFaq(dto: { question: string; answer: string; status?: string }) {
    return TaxFaqs.create({
      question: dto.question,
      answer: dto.answer,
      status: dto.status ?? '1',
      isDeleted: '0',
    } as any);
  }

  async updateFaq(id: number, dto: Partial<{ question: string; answer: string; status: string }>) {
    const faq = await TaxFaqs.findByPk(id);
    if (!faq) throw new NotFoundException('FAQ not found');
    await faq.update(dto as any);
    return faq;
  }

  async deleteFaq(id: number) {
    const faq = await TaxFaqs.findByPk(id);
    if (!faq) throw new NotFoundException('FAQ not found');
    await faq.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Hyperlinks ───────────────────────────────────────────────────────────────

  async listHyperlinks(sectionId?: number, adminAll = false) {
    const where: any = adminAll ? { isDeleted: '0' } : { isDeleted: '0', status: '1' };
    if (sectionId) where.sectionId = sectionId;
    return TaxHyperlinks.findAll({ where, order: [['id', 'ASC']] });
  }

  async createHyperlink(dto: {
    title: string;
    link: string;
    linkType?: string;
    sectionId?: number;
    status?: string;
  }) {
    return TaxHyperlinks.create({
      title: dto.title,
      link: dto.link,
      linkType: dto.linkType ?? null,
      sectionId: dto.sectionId ?? null,
      status: dto.status ?? '1',
      isDeleted: '0',
    } as any);
  }

  async updateHyperlink(id: number, dto: Partial<{
    title: string;
    link: string;
    linkType: string;
    sectionId: number;
    status: string;
  }>) {
    const link = await TaxHyperlinks.findByPk(id);
    if (!link) throw new NotFoundException('Link not found');
    await link.update(dto as any);
    return link;
  }

  async deleteHyperlink(id: number) {
    const link = await TaxHyperlinks.findByPk(id);
    if (!link) throw new NotFoundException('Link not found');
    await link.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Sections (shared `section` table, type='tax') ─────────────────────────
  //
  // Legacy `Tax\Controller\HomeController` groups docs + hyperlinks under
  // sections. Same shape as Insurance — section.type='tax'.

  async listSections() {
    return Section.findAll({
      where: { type: 'tax', status: '1', isDeleted: '0' } as any,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });
  }

  async getSection(id: number) {
    const s = await Section.findByPk(id);
    if (!s) throw new NotFoundException('Section not found');
    return s;
  }

  /** Sectioned dashboard — sections + top-N hyperlinks/documents/FAQs per section. */
  async getDashboard() {
    const sections = await this.listSections();
    const result = [] as Array<{ id: number; name: string; hyperlinks: any[]; documents: any[] }>;
    for (const sec of sections as any[]) {
      const [hyperlinks, documents] = await Promise.all([
        TaxHyperlinks.findAll({
          where: { status: '1', isDeleted: '0', sectionId: sec.id } as any,
          order: [['id', 'DESC']],
          limit: 4,
        }),
        TaxDocuments.findAll({
          where: { status: '1', isDeleted: '0', sectionId: sec.id } as any,
          order: [['id', 'DESC']],
          limit: 3,
        }),
      ]);
      result.push({ id: sec.id, name: sec.name, hyperlinks, documents });
    }
    const faqs = await this.listFaqs();
    return { sections: result, faqs };
  }
}
