import { Injectable } from '@nestjs/common';
import { Op } from '@hero/db';
import { Employee, Department, HeroLocation } from '@hero/db/src/models/generated';

export interface EmployeeListOpts {
  departmentId?: number;
  locationId?: number;
  grade?: string;
  designation?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class EmployeeService {
  async list(opts: EmployeeListOpts = {}) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const pageSize = Math.min(opts.pageSize ?? 25, 200);
    const where: any = { state: { [Op.ne]: '0' } };
    if (opts.departmentId) where.department = opts.departmentId;
    if (opts.locationId) where.location = opts.locationId;
    if (opts.grade) where.grade = opts.grade;
    if (opts.designation) where.designation = opts.designation;
    if (opts.q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${opts.q}%` } },
        { ecode: { [Op.like]: `%${opts.q}%` } },
        { email: { [Op.like]: `%${opts.q}%` } },
        { displayName: { [Op.like]: `%${opts.q}%` } },
      ];
    }
    const { rows, count } = await Employee.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return { items: rows, total: count, page, pageSize };
  }

  async findById(id: number) {
    return Employee.findByPk(id, { attributes: { exclude: ['password'] } });
  }

  async findByEcode(ecode: string) {
    return Employee.findOne({
      where: { ecode } as any,
      attributes: { exclude: ['password'] },
    });
  }

  async upcomingBirthdays(daysAhead = 14) {
    // Match (month, day) on dob within a rolling window.
    const today = new Date();
    const window: Array<[number, number]> = [];
    for (let i = 0; i <= daysAhead; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      window.push([d.getMonth() + 1, d.getDate()]);
    }
    const all = (await Employee.findAll({
      where: { dob: { [Op.ne]: null }, state: { [Op.ne]: '0' } } as any,
      attributes: ['userId', 'name', 'dob', 'profilepic', 'department', 'location'],
    })) as any[];
    return all.filter((e) => {
      if (!e.dob) return false;
      const d = new Date(e.dob);
      return window.some(([m, day]) => d.getMonth() + 1 === m && d.getDate() === day);
    });
  }

  async departments() {
    return Department.findAll({ order: [['name', 'ASC']] });
  }

  async locations() {
    return HeroLocation.findAll({ order: [['name', 'ASC']] });
  }
}
