// Manually created from module/Insurance/src/Entity/Hyperlinks.php
// Table: insurance_hyperlinks

import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull } from 'sequelize-typescript';

@Table({ tableName: 'insurance_hyperlinks', timestamps: false })
export class InsuranceHyperlinks extends Model<InsuranceHyperlinks> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'id' })
  declare id: any;

  @Column({ type: DataType.STRING(255), field: 'title' })
  declare title: any;

  @Column({ type: DataType.STRING(500), field: 'link' })
  declare link: any;

  @AllowNull(true)
  @Column({ type: DataType.STRING(50), field: 'link_type' })
  declare linkType: any;

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

export default InsuranceHyperlinks;
