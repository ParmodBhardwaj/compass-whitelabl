import { Injectable, NotFoundException } from '@nestjs/common';
import { Op, getDb, QueryTypes } from '@hero/db';
import {
  VisitorAppointment,
  VisitorAppointmentUsers,
  VisitorLocations,
  VisitorPass,
  VisitorBatches,
  VisitorBatchAssigned,
  VisitorApprovalMembers,
} from '@hero/db/src/models/generated';

/** A single visitor inside an appointment (matches `visitor_appointment_users`). */
export interface VisitorProfile {
  visitorName: string;
  mobile: string;
  visitorEmail: string;
  laptopNumber?: string;
  otherMaterial?: string;
}

export interface AppointmentDto {
  visitorLocationId: number;
  company: string;
  purposeOfVisit?: string;
  contactPerson: number;
  visitorMaterials?: string;
  requestCreatedBy: string;       // legacy stored employee name; we send userId as string
  passType?: string;              // 'red' | 'green' | 'blue' (matches Batches enum + Pass.red_pass_approval)
  remarks?: string;
  validFromDate: string;
  validFromTime: string;
  validToDate: string;
  validToTime: string;
  multipleDates?: string;
  mealAllowed?: 'yes' | 'no';
  /**
   * The actual visitor people. Each row creates a `visitor_appointment_users`
   * record. Legacy supports multi-visitor appointments — every Hero plant
   * walk-in is a batch of N visitor profiles linked to one appointment row.
   */
  visitors?: VisitorProfile[];
}

/**
 * Visitor Gate Pass — Wave 3 module.
 *
 * Employees book visitor appointments. Security approves and issues gate passes.
 * Visitors can be pre-registered or walk-in.
 *
 * Tables:
 *   visitor_appointment       — appointment/pass request
 *   visitor_appointment_users — visitor list per appointment
 *   visitor_locations         — plant locations
 *   visitor_pass              — pass template per location
 *   visitor_batches           — visitor info batches
 *   visitor_batch_assigned    — batches assigned to appointment
 */
@Injectable()
export class VisitorsService {
  // ── Master data ──────────────────────────────────────────────────────────────

  async getLocations() {
    return VisitorLocations.findAll({ order: [['id', 'ASC']] });
  }

  async getPasses(locationId?: number) {
    const where: any = { status: '1' };
    if (locationId) where.locationId = locationId;
    return VisitorPass.findAll({ where });
  }

  // ── Appointments ─────────────────────────────────────────────────────────────

  async listAppointments(opts: {
    requestCreatedBy?: string;
    contactPerson?: number;
    locationId?: number;
    status?: string;
    from?: string;
    to?: string;
    all?: boolean;
  } = {}) {
    const where: any = {};
    if (opts.locationId) where.visitorLocationId = opts.locationId;
    if (opts.status) where.requestStatus = opts.status;
    if (opts.from && opts.to) {
      where.validFromDate = { [Op.between]: [opts.from, opts.to] };
    } else if (opts.from) {
      where.validFromDate = { [Op.gte]: opts.from };
    }
    if (!opts.all) {
      if (opts.contactPerson) where.contactPerson = opts.contactPerson;
      else if (opts.requestCreatedBy) where.requestCreatedBy = opts.requestCreatedBy;
    }
    return VisitorAppointment.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async getAppointment(id: number) {
    const appt = await VisitorAppointment.findByPk(id);
    if (!appt) throw new NotFoundException('Appointment not found');
    const visitors = await VisitorAppointmentUsers.findAll({
      where: { appointmentId: id } as any,
    });
    return { appointment: appt, visitors };
  }

  async createAppointment(dto: AppointmentDto) {
    const appt = await VisitorAppointment.create({
      visitorLocationId: dto.visitorLocationId,
      company: dto.company,
      purposeOfVisit: dto.purposeOfVisit ?? null,
      contactPerson: dto.contactPerson,
      visitorMaterials: dto.visitorMaterials ?? null,
      requestCreatedBy: dto.requestCreatedBy,
      passType: dto.passType ?? null,
      remarks: dto.remarks ?? null,
      validFromDate: dto.validFromDate,
      validFromTime: dto.validFromTime,
      validToDate: dto.validToDate,
      validToTime: dto.validToTime,
      multipleDates: dto.multipleDates ?? null,
      mealAllowed: dto.mealAllowed === 'yes' || dto.mealAllowed === 'no' ? dto.mealAllowed : 'no',
      requestStatus: 'pending',
      employeeApproved: '0',
      barcodeNumber: `VP${Date.now()}`,
      feedbackSmsStatus: '0',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const appointmentId = (appt as any).id;

    // Persist the visitor profiles. Legacy uses one row per visitor in
    // visitor_appointment_users — supports walk-ins with multiple people.
    if (dto.visitors?.length) {
      for (const v of dto.visitors) {
        await VisitorAppointmentUsers.create({
          appointmentId,
          visitorName: v.visitorName,
          mobile: v.mobile,
          visitorEmail: v.visitorEmail ?? '',
          laptopNumber: v.laptopNumber ?? null,
          otherMaterial: v.otherMaterial ?? null,
          tokenCount: 0,
          feedbackNotification: '0',
          expectedArrival: '0',
          videoSeen: '0',
          medicalTest: '0',
        } as any);
      }
    }

    return appt;
  }

  /**
   * Frequent visitors for the logged-in employee. Aggregates
   * `visitor_appointment_users` over all past appointments where the
   * appointment's contact_person matches the user, grouped by mobile
   * (the natural identity key).
   */
  async listFrequentVisitors(contactPerson: number, limit = 50) {
    const rows = (await getDb().query(
      `SELECT u.visitor_name      AS visitorName,
              u.mobile            AS mobile,
              MAX(u.visitor_email) AS email,
              COUNT(*)            AS visitCount,
              MAX(u.appointment_id) AS lastAppointmentId
         FROM visitor_appointment_users u
         JOIN visitor_appointment a ON a.id = u.appointment_id
        WHERE a.contact_person = :uid
        GROUP BY u.mobile, u.visitor_name
        ORDER BY visitCount DESC, lastAppointmentId DESC
        LIMIT :lim`,
      {
        replacements: { uid: contactPerson, lim: limit },
        type: QueryTypes.SELECT,
      },
    )) as Array<{
      visitorName: string;
      mobile: string;
      email?: string;
      visitCount: number;
      lastAppointmentId: number;
    }>;
    return rows;
  }

  /**
   * Approval members reachable for a given (location, pass_type) — used by
   * the appointment-status page and admin to show who must approve.
   */
  async listApprovalMembers(locationId: number, passType?: string) {
    const where: any = { locationId };
    if (passType) {
      where.passTypeApproval = { [Op.in]: ['all', passType] };
    }
    return VisitorApprovalMembers.findAll({ where, order: [['id', 'ASC']] });
  }

  /**
   * Build a printable gate-pass payload for a single appointment. Returns
   * the appointment header + every visitor row so the print view can fan
   * out one card per visitor (the legacy template prints one barcode pass
   * per visitor).
   */
  async gatePass(appointmentId: number) {
    const appointment = await VisitorAppointment.findByPk(appointmentId);
    if (!appointment) throw new NotFoundException('Appointment not found');
    const [visitors, location] = await Promise.all([
      VisitorAppointmentUsers.findAll({ where: { appointmentId } as any }),
      VisitorLocations.findByPk((appointment as any).visitorLocationId),
    ]);
    return { appointment, location, visitors };
  }

  /**
   * Pending employee feedback inbox — appointments where the employee was
   * the contact_person, visit window has passed, and feedback_sms_status
   * is still '0' (no feedback recorded yet).
   */
  async pendingEmployeeFeedback(contactPerson: number, limit = 50) {
    const today = new Date().toISOString().slice(0, 10);
    return VisitorAppointment.findAll({
      where: {
        contactPerson,
        feedbackSmsStatus: '0',
        validToDate: { [Op.lt]: today },
        requestStatus: 'approved',
      } as any,
      order: [['validToDate', 'DESC']],
      limit,
    });
  }

  async submitEmployeeFeedback(appointmentId: number, rating: number, comment?: string) {
    const appt = await VisitorAppointment.findByPk(appointmentId);
    if (!appt) throw new NotFoundException('Appointment not found');
    await appt.update({
      feedbackSmsStatus: '1',
      employeeFeedbackRating: rating,
      employeeFeedbackComment: comment ?? null,
      updatedAt: new Date(),
    } as any);
    return { ok: true };
  }

  /**
   * Visitor checkout — security marks a single visitor as checked out.
   * Updates visitor_appointment_users.visitor_checkout, and if every
   * visitor on the appointment has checked out, marks the appointment
   * itself complete.
   */
  async checkoutVisitor(visitorRowId: number) {
    const v = await VisitorAppointmentUsers.findByPk(visitorRowId);
    if (!v) throw new NotFoundException('Visitor row not found');
    await v.update({ visitorCheckout: new Date() } as any);
    const remaining = await VisitorAppointmentUsers.count({
      where: { appointmentId: (v as any).appointmentId, visitorCheckout: null } as any,
    });
    if (remaining === 0) {
      const appt = await VisitorAppointment.findByPk((v as any).appointmentId);
      if (appt) await appt.update({ requestStatus: 'completed', updatedAt: new Date() } as any);
    }
    return { ok: true, remaining };
  }

  async approveAppointment(id: number, approverId: number, approved: boolean, remarks?: string) {
    const appt = await VisitorAppointment.findByPk(id);
    if (!appt) throw new NotFoundException('Appointment not found');
    const status = approved ? 'approved' : 'rejected';
    await appt.update({
      requestStatus: status,
      employeeApproved: approved ? '1' : '0',
      employeeRequestApprovedBy: approverId,
      remarks: remarks ?? (appt as any).remarks,
      updatedAt: new Date(),
    } as any);
    return appt;
  }

  async cancelAppointment(id: number) {
    const appt = await VisitorAppointment.findByPk(id);
    if (!appt) throw new NotFoundException('Appointment not found');
    await appt.update({ requestStatus: 'cancelled', updatedAt: new Date() } as any);
    return { id, cancelled: true };
  }

  // ── Batches ──────────────────────────────────────────────────────────────────

  async listBatches(locationId?: number) {
    const where: any = {};
    if (locationId) where.locationId = locationId;
    return VisitorBatches.findAll({ where, order: [['id', 'DESC']] });
  }

  /**
   * Pending-for-Card list — approved appointments where the visitor hasn't
   * checked in yet. Each row is a (visitor, appointment) pair so the table
   * shows one row per visitor (matches legacy
   * AppointmentStatusController::indexAction shape).
   */
  async pendingForCard(opts: { contactPerson?: number; locationId?: number; all?: boolean } = {}) {
    return this.flattenAppointmentVisitors({
      ...opts,
      requestStatus: 'approved',
      checkinNull: true,
    });
  }

  /**
   * Pending-for-Checkout list — appointments where visitors have checked in
   * but not yet checked out. Mirrors legacy CheckoutPendingController.
   */
  async pendingForCheckout(opts: { contactPerson?: number; locationId?: number; all?: boolean } = {}) {
    return this.flattenAppointmentVisitors({
      ...opts,
      requestStatus: 'approved',
      checkinNotNull: true,
      checkoutNull: true,
    });
  }

  /**
   * Pending-for-Approval inbox for the logged-in employee — appointments
   * where they are the contact_person (and the appointment is still pending).
   * Mirrors legacy EmployeeApprovalController::indexAction.
   */
  async pendingForApproval(contactPerson: number, opts: { locationId?: number } = {}) {
    const where: any = {
      requestStatus: 'pending',
      contactPerson,
    };
    if (opts.locationId) where.visitorLocationId = opts.locationId;
    const appts = await VisitorAppointment.findAll({
      where,
      order: [['validFromDate', 'ASC'], ['validFromTime', 'ASC']],
    });
    if (!appts.length) return [];
    const apptIds = (appts as any[]).map((a) => a.id);
    const visitors = await VisitorAppointmentUsers.findAll({
      where: { appointmentId: { [Op.in]: apptIds } } as any,
      raw: true,
    }) as any[];
    const locIds = [...new Set((appts as any[]).map((a) => a.visitorLocationId).filter(Boolean))];
    const locs = locIds.length
      ? await VisitorLocations.findAll({ where: { id: { [Op.in]: locIds } } as any, raw: true }) as any[]
      : [];
    const locById = new Map(locs.map((l) => [l.id, l.locationName ?? l.name]));
    const byAppt = new Map<number, any[]>();
    for (const v of visitors) {
      if (!byAppt.has(v.appointmentId)) byAppt.set(v.appointmentId, []);
      byAppt.get(v.appointmentId)!.push(v);
    }
    return (appts as any[]).map((a) => ({
      appointmentId: a.id,
      visitors: byAppt.get(a.id) ?? [],
      company: a.company,
      hostName: null, // employee name lookup — populated by frontend via /employees/:id if needed
      contactPerson: a.contactPerson,
      visitorLocationId: a.visitorLocationId,
      locationName: locById.get(a.visitorLocationId) ?? `#${a.visitorLocationId}`,
      validFromDate: a.validFromDate,
      validFromTime: a.validFromTime,
      validToDate: a.validToDate,
      validToTime: a.validToTime,
      passType: a.passType,
      gateName: (a as any).gateName,
      requestStatus: a.requestStatus,
      requestCreatedBy: a.requestCreatedBy,
      passApprover: (a as any).passApprover ?? null,
    }));
  }

  /**
   * Common flattener used by `pendingForCard` + `pendingForCheckout`.
   * Joins visitor_appointment with visitor_appointment_users and filters by
   * the supplied checkin/checkout nullability flags.
   */
  private async flattenAppointmentVisitors(opts: {
    contactPerson?: number;
    locationId?: number;
    all?: boolean;
    requestStatus?: string;
    checkinNull?: boolean;
    checkinNotNull?: boolean;
    checkoutNull?: boolean;
  }) {
    const apptWhere: any = {};
    if (opts.requestStatus) apptWhere.requestStatus = opts.requestStatus;
    if (opts.locationId) apptWhere.visitorLocationId = opts.locationId;
    if (!opts.all && opts.contactPerson) apptWhere.contactPerson = opts.contactPerson;

    const visitorWhere: any = {};
    if (opts.checkinNull) visitorWhere.visitorCheckin = { [Op.is]: null };
    if (opts.checkinNotNull) visitorWhere.visitorCheckin = { [Op.not]: null };
    if (opts.checkoutNull) visitorWhere.visitorCheckout = { [Op.is]: null };

    const visitors = await VisitorAppointmentUsers.findAll({
      where: visitorWhere,
      raw: true,
    }) as any[];
    if (!visitors.length) return [];

    const apptIds = [...new Set(visitors.map((v) => v.appointmentId))];
    const appts = await VisitorAppointment.findAll({
      where: { ...apptWhere, id: { [Op.in]: apptIds } } as any,
      raw: true,
    }) as any[];
    const apptById = new Map(appts.map((a) => [a.id, a]));

    const locIds = [...new Set(appts.map((a) => a.visitorLocationId).filter(Boolean))];
    const locs = locIds.length
      ? await VisitorLocations.findAll({ where: { id: { [Op.in]: locIds } } as any, raw: true }) as any[]
      : [];
    const locById = new Map(locs.map((l) => [l.id, l.locationName ?? l.name]));

    // Filter visitors whose appointment didn't pass the appt filter.
    const out = [] as any[];
    for (const v of visitors) {
      const a = apptById.get(v.appointmentId);
      if (!a) continue;
      out.push({
        id: v.id,
        appointmentId: a.id,
        visitorId: v.id,
        visitorName: v.visitorName,
        visitorMobile: v.mobile,
        visitorEmail: v.visitorEmail,
        visitorCheckin: v.visitorCheckin,
        visitorCheckout: v.visitorCheckout,
        company: a.company,
        visitorLocationId: a.visitorLocationId,
        locationName: locById.get(a.visitorLocationId) ?? `#${a.visitorLocationId}`,
        appStartDate: `${a.validFromDate ?? ''} ${a.validFromTime ?? ''}`.trim(),
        appEndDate:   `${a.validToDate ?? ''} ${a.validToTime ?? ''}`.trim(),
        validFromDate: a.validFromDate,
        validFromTime: a.validFromTime,
        validToDate: a.validToDate,
        validToTime: a.validToTime,
        gateName: a.gateName,
        passType: a.passType,
        requestStatus: a.requestStatus,
      });
    }
    return out;
  }

  /**
   * Today's pending appointments — shown in the right-hand sidebar of the
   * Add Appointment screen so the user can see overlaps before booking.
   * Matches legacy `AppointmentController::addAction` $todayAppointments.
   */
  async todayPendingAppointments(contactPerson?: number, locationId?: number) {
    const today = new Date().toISOString().slice(0, 10);
    const where: any = {
      validFromDate: today,
      requestStatus: { [Op.in]: ['pending', 'approved'] },
    };
    if (contactPerson) where.contactPerson = contactPerson;
    if (locationId) where.visitorLocationId = locationId;
    const appts = await VisitorAppointment.findAll({
      where,
      order: [['validFromTime', 'ASC']],
      limit: 25,
    });
    if (!appts.length) return [];
    const apptIds = (appts as any[]).map((a) => a.id);
    const visitors = await VisitorAppointmentUsers.findAll({
      where: { appointmentId: { [Op.in]: apptIds } } as any,
      raw: true,
    }) as any[];
    const byAppt = new Map<number, any[]>();
    for (const v of visitors) {
      if (!byAppt.has(v.appointmentId)) byAppt.set(v.appointmentId, []);
      byAppt.get(v.appointmentId)!.push(v);
    }
    return (appts as any[]).map((a) => ({
      id: a.id,
      time: a.validFromTime,
      company: a.company,
      requestStatus: a.requestStatus,
      visitors: byAppt.get(a.id) ?? [],
    }));
  }

  async stats(opts: { contactPerson?: number } = {}) {
    const base: any = {};
    if (opts.contactPerson) base.contactPerson = opts.contactPerson;
    const [total, pending, approved, rejected] = await Promise.all([
      VisitorAppointment.count({ where: base }),
      VisitorAppointment.count({ where: { ...base, requestStatus: 'pending' } }),
      VisitorAppointment.count({ where: { ...base, requestStatus: 'approved' } }),
      VisitorAppointment.count({ where: { ...base, requestStatus: 'rejected' } }),
    ]);
    return { total, pending, approved, rejected };
  }
}
