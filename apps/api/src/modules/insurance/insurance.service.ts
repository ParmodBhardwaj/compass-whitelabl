import { Injectable, NotFoundException } from '@nestjs/common';
import {
  InsuranceDocuments,
  InsuranceFaqs,
  InsuranceHyperlinks,
  Section,
} from '@hero/db/src/models/generated';

/**
 * Insurance Portal — Wave 3 module.
 *
 * Mirrors the Tax module structure. Provides insurance-related documents,
 * FAQs, and hyperlinks to employees.
 *
 * Tables: insurance_documents, insurance_faqs, insurance_hyperlinks
 */
@Injectable()
export class InsuranceService {
  // ── Documents ────────────────────────────────────────────────────────────────

  async listDocuments(sectionId?: number, adminAll = false) {
    const where: any = adminAll ? { isDeleted: '0' } : { isDeleted: '0', status: '1' };
    if (sectionId) where.sectionId = sectionId;
    return InsuranceDocuments.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async getDocument(id: number) {
    const doc = await InsuranceDocuments.findByPk(id);
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
    // documentName/documentType columns are NOT NULL — default to empty string
    return InsuranceDocuments.create({
      title: dto.title,
      documentName: dto.documentName ?? '',
      documentType: dto.documentType ?? '',
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
    const doc = await InsuranceDocuments.findByPk(id);
    if (!doc) throw new NotFoundException('Document not found');
    await doc.update(dto as any);
    return doc;
  }

  async deleteDocument(id: number) {
    const doc = await InsuranceDocuments.findByPk(id);
    if (!doc) throw new NotFoundException('Document not found');
    await doc.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── FAQs ─────────────────────────────────────────────────────────────────────

  async listFaqs(adminAll = false) {
    const where: any = adminAll ? { isDeleted: '0' } : { isDeleted: '0', status: '1' };
    return InsuranceFaqs.findAll({ where, order: [['id', 'ASC']] });
  }

  async createFaq(dto: { question: string; answer: string; status?: string }) {
    return InsuranceFaqs.create({
      question: dto.question,
      answer: dto.answer,
      status: dto.status ?? '1',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }

  async updateFaq(id: number, dto: Partial<{ question: string; answer: string; status: string }>) {
    const faq = await InsuranceFaqs.findByPk(id);
    if (!faq) throw new NotFoundException('FAQ not found');
    await faq.update(dto as any);
    return faq;
  }

  async deleteFaq(id: number) {
    const faq = await InsuranceFaqs.findByPk(id);
    if (!faq) throw new NotFoundException('FAQ not found');
    await faq.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Hyperlinks ───────────────────────────────────────────────────────────────

  async listHyperlinks(sectionId?: number, adminAll = false) {
    const where: any = adminAll ? { isDeleted: '0' } : { isDeleted: '0', status: '1' };
    if (sectionId) where.sectionId = sectionId;
    return InsuranceHyperlinks.findAll({ where, order: [['id', 'ASC']] });
  }

  async createHyperlink(dto: {
    title: string;
    link: string;
    linkType?: string;
    sectionId?: number;
    status?: string;
  }) {
    // linkType column is NOT NULL — default to 'external'
    return InsuranceHyperlinks.create({
      title: dto.title,
      link: dto.link,
      linkType: dto.linkType ?? 'external',
      sectionId: dto.sectionId ?? null,
      status: dto.status ?? '1',
      isDeleted: '0',
      createdAt: new Date(),
    } as any);
  }

  async updateHyperlink(id: number, dto: Partial<{
    title: string;
    link: string;
    linkType: string;
    sectionId: number;
    status: string;
  }>) {
    const link = await InsuranceHyperlinks.findByPk(id);
    if (!link) throw new NotFoundException('Link not found');
    await link.update(dto as any);
    return link;
  }

  async deleteHyperlink(id: number) {
    const link = await InsuranceHyperlinks.findByPk(id);
    if (!link) throw new NotFoundException('Link not found');
    await link.update({ isDeleted: '1' } as any);
    return { id, deleted: true };
  }

  // ── Sections (shared `section` table, type='insurance') ─────────────────
  //
  // Legacy `Insurance\Controller\HomeController` groups documents + hyperlinks
  // under sections. Sections live in `section` table where type='insurance'.

  async listSections() {
    return Section.findAll({
      where: { type: 'insurance', status: '1', isDeleted: '0' } as any,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });
  }

  async getSection(id: number) {
    const s = await Section.findByPk(id);
    if (!s) throw new NotFoundException('Section not found');
    return s;
  }

  /**
   * Dashboard payload: every active insurance section paired with its
   * top-N hyperlinks (4) and documents (3). Mirrors legacy `HomeController::indexAction`.
   */
  async getDashboard() {
    const sections = await this.listSections();
    const result = [] as Array<{ id: number; name: string; hyperlinks: any[]; documents: any[] }>;
    for (const sec of sections as any[]) {
      const [hyperlinks, documents] = await Promise.all([
        InsuranceHyperlinks.findAll({
          where: { status: '1', isDeleted: '0', sectionId: sec.id } as any,
          order: [['id', 'DESC']],
          limit: 4,
        }),
        InsuranceDocuments.findAll({
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
