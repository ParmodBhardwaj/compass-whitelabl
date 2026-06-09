// Manually created from module/Insurance/src/Entity/FAQ.php
// Table: insurance_faqs

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({ tableName: 'insurance_faqs', timestamps: false })
export class InsuranceFaqs extends Model<InsuranceFaqs> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id' })
  declare id: any;

  @Column({ type: DataType.TEXT, field: 'question' })
  declare question: any;

  @Column({ type: DataType.TEXT, field: 'answer' })
  declare answer: any;

  @Column({ type: DataType.STRING, field: 'status' })
  declare status: any;

  @Column({ type: DataType.STRING, field: 'is_deleted' })
  declare isDeleted: any;

  @Column({ type: DataType.DATE, field: 'created_at' })
  declare createdAt: any;
}

export default InsuranceFaqs;
