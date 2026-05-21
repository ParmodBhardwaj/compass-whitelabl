import { Injectable, Logger } from '@nestjs/common';
import { Op } from '@hero/db';
import { BRAND } from '../../common/brand';
import {
  TrainingScore,
  KaizenRequest,
  OeeRequest,
  MpRequest,
  HazardRequest,
  VisitorAppointment,
} from '@hero/db/src/models/generated';

/**
 * Report — Wave 4 module.
 *
 * Generates Excel (.xlsx) reports for each major module.
 * Uses `exceljs` for workbook generation.
 *
 * Install: pnpm --filter @hero/api add exceljs
 */
@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  /**
   * Lazily load exceljs to avoid crashing if it isn't installed yet.
   */
  private async getExcelJs() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('exceljs') as typeof import('exceljs');
    } catch {
      throw new Error(
        'exceljs is not installed. Run: pnpm --filter @hero/api add exceljs',
      );
    }
  }

  // ── Training ────────────────────────────────────────────────────────────────

  async trainingReport(opts: {
    from?: string;
    to?: string;
    trainingType?: string;
    createdBy?: number;
  }): Promise<Buffer> {
    const ExcelJS = await this.getExcelJs();

    const where: any = { isDeleted: '0' };
    if (opts.trainingType) where.trainingType = opts.trainingType;
    if (opts.createdBy) where.createdBy = opts.createdBy;
    if (opts.from && opts.to) {
      where.trainingDate = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.trainingDate = { [Op.gte]: opts.from };
    } else if (opts.to) {
      where.trainingDate = { [Op.lte]: opts.to };
    }

    const rows = await TrainingScore.findAll({ where, order: [['trainingDate', 'DESC']], raw: true });

    const wb = new ExcelJS.Workbook();
    wb.creator = BRAND.productName;
    wb.created = new Date();

    const ws = wb.addWorksheet('Training Records');
    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Training Name', key: 'trainingName', width: 35 },
      { header: 'Type', key: 'trainingType', width: 14 },
      { header: 'Date', key: 'trainingDate', width: 14 },
      { header: 'Days', key: 'trainingDays', width: 8 },
      { header: 'Location', key: 'trainingLocation', width: 20 },
      { header: 'Score (%)', key: 'trainingScore', width: 12 },
      { header: 'Key Learnings', key: 'trainingLearning', width: 50 },
      { header: 'Created By (ID)', key: 'createdBy', width: 16 },
      { header: 'Created On', key: 'createdOn', width: 18 },
    ];

    styleHeaderRow(ws);

    for (const r of rows as any[]) {
      ws.addRow({
        id: r.id,
        trainingName: r.training_name ?? r.trainingName,
        trainingType: r.training_type ?? r.trainingType,
        trainingDate: r.training_date ?? r.trainingDate,
        trainingDays: r.training_days ?? r.trainingDays,
        trainingLocation: r.training_location ?? r.trainingLocation,
        trainingScore: r.training_score ?? r.trainingScore,
        trainingLearning: r.training_learning ?? r.trainingLearning,
        createdBy: r.created_by ?? r.createdBy,
        createdOn: r.created_on ?? r.createdOn,
      });
    }

    addAutoFilter(ws);
    return bufferFrom(wb);
  }

  // ── Kaizen ──────────────────────────────────────────────────────────────────

  async kaizenReport(opts: {
    from?: string;
    to?: string;
    departmentId?: number;
    status?: string;
  }): Promise<Buffer> {
    const ExcelJS = await this.getExcelJs();

    const where: any = { isDeleted: '0' };
    if (opts.departmentId) where.departmentId = opts.departmentId;
    if (opts.status) where.status = opts.status;
    if (opts.from && opts.to) {
      where.startDate = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.startDate = { [Op.gte]: opts.from };
    }

    const rows = await KaizenRequest.findAll({ where, order: [['createdOn', 'DESC']], raw: true });

    const wb = new ExcelJS.Workbook();
    wb.creator = BRAND.productName;
    wb.created = new Date();

    const ws = wb.addWorksheet('Kaizen Records');
    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Kaizen No', key: 'kaizenNo', width: 16 },
      { header: 'Idea / Theme', key: 'idea', width: 35 },
      { header: 'Category', key: 'category', width: 16 },
      { header: 'Type', key: 'type', width: 14 },
      { header: 'Start Date', key: 'startDate', width: 14 },
      { header: 'End Date', key: 'endDate', width: 14 },
      { header: 'Problem', key: 'problemDefinition', width: 45 },
      { header: 'Counter Measure', key: 'counterMeasure', width: 45 },
      { header: 'Annual Benefits', key: 'annualBenefits', width: 16 },
      { header: 'Investment', key: 'investment', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Created By (ID)', key: 'createdBy', width: 16 },
    ];

    styleHeaderRow(ws);

    for (const r of rows as any[]) {
      ws.addRow({
        id: r.id,
        kaizenNo: r.kaizen_no ?? r.kaizenNo,
        idea: r.idea,
        category: r.category,
        type: r.type,
        startDate: r.start_date ?? r.startDate,
        endDate: r.end_date ?? r.endDate,
        problemDefinition: r.problem_definition ?? r.problemDefinition,
        counterMeasure: r.counter_measure ?? r.counterMeasure,
        annualBenefits: r.annual_benefits ?? r.annualBenefits,
        investment: r.investment,
        status: r.status,
        createdBy: r.created_by ?? r.createdBy,
      });
    }

    addAutoFilter(ws);
    return bufferFrom(wb);
  }

  // ── OEE ─────────────────────────────────────────────────────────────────────

  async oeeReport(opts: {
    from?: string;
    to?: string;
    departmentId?: number;
    sectionId?: number;
  }): Promise<Buffer> {
    const ExcelJS = await this.getExcelJs();

    const where: any = { isDeleted: '0' };
    if (opts.departmentId) where.departmentId = opts.departmentId;
    if (opts.sectionId) where.sectionId = opts.sectionId;
    if (opts.from && opts.to) {
      where.shiftDate = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.shiftDate = { [Op.gte]: opts.from };
    }

    const rows = await OeeRequest.findAll({ where, order: [['shiftDate', 'DESC']], raw: true });

    const wb = new ExcelJS.Workbook();
    wb.creator = BRAND.productName;
    wb.created = new Date();

    const ws = wb.addWorksheet('OEE Records');
    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Shift Date', key: 'shiftDate', width: 14 },
      { header: 'Shift', key: 'shift', width: 10 },
      { header: 'Machine', key: 'machineName', width: 24 },
      { header: 'Availability (%)', key: 'availability', width: 18 },
      { header: 'Performance (%)', key: 'performance', width: 18 },
      { header: 'Quality (%)', key: 'quality', width: 14 },
      { header: 'OEE (%)', key: 'oee', width: 12 },
      { header: 'Planned Time (min)', key: 'plannedProductionTime', width: 20 },
      { header: 'Actual Time (min)', key: 'actualProductionTime', width: 20 },
      { header: 'Total Parts', key: 'totalParts', width: 14 },
      { header: 'Good Parts', key: 'goodParts', width: 14 },
      { header: 'Reject Parts', key: 'rejectParts', width: 14 },
      { header: 'Breakdown (min)', key: 'breakdownTime', width: 18 },
      { header: 'Created By (ID)', key: 'createdBy', width: 16 },
    ];

    styleHeaderRow(ws);

    for (const r of rows as any[]) {
      // Compute OEE on the fly if not stored
      const avail = r.availability ?? r.availability_percent ?? 0;
      const perf = r.performance ?? r.performance_percent ?? 0;
      const qual = r.quality ?? r.quality_percent ?? 0;
      const oee = ((avail / 100) * (perf / 100) * (qual / 100) * 100).toFixed(2);

      ws.addRow({
        id: r.id,
        shiftDate: r.shift_date ?? r.shiftDate,
        shift: r.shift,
        machineName: r.machine_name ?? r.machineName,
        availability: avail,
        performance: perf,
        quality: qual,
        oee,
        plannedProductionTime: r.planned_production_time ?? r.plannedProductionTime,
        actualProductionTime: r.actual_production_time ?? r.actualProductionTime,
        totalParts: r.total_parts ?? r.totalParts,
        goodParts: r.good_parts ?? r.goodParts,
        rejectParts: r.reject_parts ?? r.rejectParts,
        breakdownTime: r.breakdown_time ?? r.breakdownTime,
        createdBy: r.created_by ?? r.createdBy,
      });
    }

    addAutoFilter(ws);

    // Conditional formatting: OEE column (H)
    ws.getColumn('oee').eachCell({ includeEmpty: false }, (cell: any, rowNumber: number) => {
      if (rowNumber === 1) return;
      const val = parseFloat(String(cell.value ?? 0));
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: val >= 85 ? 'FFD4EDDA' : val >= 65 ? 'FFFFF3CD' : 'FFF8D7DA',
        },
      };
    });

    return bufferFrom(wb);
  }

  // ── MP Sheet ─────────────────────────────────────────────────────────────────

  async mpsheetReport(opts: {
    from?: string;
    to?: string;
    status?: string;
    plantId?: number;
  }): Promise<Buffer> {
    const ExcelJS = await this.getExcelJs();

    const where: any = { isDeleted: '0' };
    if (opts.status) where.status = opts.status;
    if (opts.plantId) where.plantId = opts.plantId;
    if (opts.from && opts.to) {
      where.createdAt = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.createdAt = { [Op.gte]: opts.from };
    }

    const rows = await MpRequest.findAll({ where, order: [['createdAt', 'DESC']], raw: true });

    const wb = new ExcelJS.Workbook();
    wb.creator = BRAND.productName;
    wb.created = new Date();

    const ws = wb.addWorksheet('MP Sheet');
    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Equipment', key: 'equipmentName', width: 30 },
      { header: 'Problem', key: 'problemStatement', width: 45 },
      { header: 'Root Cause', key: 'rootCause', width: 40 },
      { header: 'Counter Measure', key: 'counterMeasure', width: 40 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Type', key: 'requestType', width: 16 },
      { header: 'Plant ID', key: 'plantId', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 18 },
      { header: 'Created By (ID)', key: 'createdBy', width: 16 },
    ];

    styleHeaderRow(ws);

    for (const r of rows as any[]) {
      ws.addRow({
        id: r.id,
        equipmentName: r.equipment_name ?? r.equipmentName,
        problemStatement: r.problem_statement ?? r.problemStatement,
        rootCause: r.root_cause ?? r.rootCause,
        counterMeasure: r.counter_measure ?? r.counterMeasure,
        status: r.status,
        requestType: r.request_type ?? r.requestType,
        plantId: r.plant_id ?? r.plantId,
        createdAt: r.created_at ?? r.createdAt,
        createdBy: r.created_by ?? r.createdBy,
      });
    }

    addAutoFilter(ws);
    return bufferFrom(wb);
  }

  // ── Visitor Pass ─────────────────────────────────────────────────────────────

  async visitorReport(opts: {
    from?: string;
    to?: string;
    locationId?: number;
  }): Promise<Buffer> {
    const ExcelJS = await this.getExcelJs();

    const where: any = {};
    if (opts.locationId) where.locationId = opts.locationId;
    if (opts.from && opts.to) {
      where.visitDate = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.visitDate = { [Op.gte]: opts.from };
    }

    const rows = await VisitorAppointment.findAll({ where, order: [['visitDate', 'DESC']], raw: true });

    const wb = new ExcelJS.Workbook();
    wb.creator = BRAND.productName;
    wb.created = new Date();

    const ws = wb.addWorksheet('Visitor Log');
    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Visitor Name', key: 'visitorName', width: 24 },
      { header: 'Mobile', key: 'mobile', width: 16 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Company', key: 'companyName', width: 24 },
      { header: 'Visit Date', key: 'visitDate', width: 14 },
      { header: 'Visit Time', key: 'visitTime', width: 12 },
      { header: 'Pass Type', key: 'passType', width: 14 },
      { header: 'Purpose', key: 'purposeOfVisit', width: 35 },
      { header: 'Barcode', key: 'barcodeNumber', width: 18 },
      { header: 'Status', key: 'requestStatus', width: 14 },
    ];

    styleHeaderRow(ws);

    for (const r of rows as any[]) {
      ws.addRow({
        id: r.id,
        visitorName: r.visitor_name ?? r.visitorName,
        mobile: r.mobile,
        email: r.email,
        companyName: r.company_name ?? r.companyName,
        visitDate: r.visit_date ?? r.visitDate,
        visitTime: r.visit_time ?? r.visitTime,
        passType: r.pass_type ?? r.passType,
        purposeOfVisit: r.purpose_of_visit ?? r.purposeOfVisit,
        barcodeNumber: r.barcode_number ?? r.barcodeNumber,
        requestStatus: r.request_status ?? r.requestStatus,
      });
    }

    addAutoFilter(ws);
    return bufferFrom(wb);
  }
}

// ── Shared workbook helpers ──────────────────────────────────────────────────

function styleHeaderRow(ws: import('exceljs').Worksheet) {
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1C84C6' },
  };
  header.alignment = { vertical: 'middle', horizontal: 'center' };
  header.height = 20;
}

function addAutoFilter(ws: import('exceljs').Worksheet) {
  if (ws.rowCount < 2) return;
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: ws.columnCount },
  };
}

async function bufferFrom(wb: import('exceljs').Workbook): Promise<Buffer> {
  const ab = await wb.xlsx.writeBuffer();
  return Buffer.from(ab);
}
