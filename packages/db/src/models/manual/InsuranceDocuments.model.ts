// Manually created from module/Insurance/src/Entity/Document.php
// Table: insurance_documents

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull } from 'sequelize-typescript';

@Table({ tableName: 'insurance_documents', timestamps: false })
export class InsuranceDocuments extends Model<InsuranceDocuments> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id' })
  declare id: any;

  @Column({ type: DataType.STRING(255), field: 'title' })
  declare title: any;

  @Column({ type: DataType.STRING(255), field: 'document_name' })
  declare documentName: any;

  @Column({ type: DataType.STRING(100), field: 'document_type' })
  declare documentType: any;

  @AllowNull(true)
  @Column({ type: DataType.INTEGER, field: 'section_id' })
  declare sectionId: any;

  @Column({ type: DataType.STRING, field: 'status' })
  declare status: any;

  @Column({ type: DataType.STRING, field: 'is_deleted' })
  declare isDeleted: any;

  @Column({ type: DataType.DATE, field: 'created_at' })
  declare createdAt: any;
}

export default InsuranceDocuments;
