import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { UploadModule } from './common/upload/upload.module';
import { ExcelModule } from './common/excel/excel.module';
import { AuditLogMiddleware } from './common/audit-log/audit-log.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { AclModule } from './modules/acl/acl.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { CmsModule } from './modules/cms/cms.module';
import { MenuModule } from './modules/menu/menu.module';
import { NewsModule } from './modules/news/news.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { PolicyModule } from './modules/policy/policy.module';
import { ActivityModule } from './modules/activity/activity.module';
import { FavouritesModule } from './modules/favourites/favourites.module';
import { SearchModule } from './modules/search/search.module';
import { SopModule } from './modules/sop/sop.module';
import { AuditModule } from './modules/audit/audit.module';
import { ActivityTrackerModule } from './modules/activity-tracker/activity-tracker.module';
import { TpmModule } from './modules/tpm/tpm.module';
import { KaizenModule } from './modules/kaizen/kaizen.module';
import { IdeaModule } from './modules/idea/idea.module';
import { OeeModule } from './modules/oee/oee.module';
import { MpsheetModule } from './modules/mpsheet/mpsheet.module';
import { GuestHouseModule } from './modules/guest-house/guest-house.module';
import { CarpoolModule } from './modules/carpool/carpool.module';
import { VisitorsModule } from './modules/visitors/visitors.module';
import { SaleRentModule } from './modules/sale-rent/sale-rent.module';
import { TrainingModule } from './modules/training/training.module';
import { TaxModule } from './modules/tax/tax.module';
import { SapModule } from './modules/sap/sap.module';
import { ReportModule } from './modules/report/report.module';
import { KpointModule } from './modules/kpoint/kpoint.module';
import { RndModule } from './modules/rnd/rnd.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { DniModule } from './modules/dni/dni.module';
import { TcgModule } from './modules/tcg/tcg.module';
import { QualityAlertModule } from './modules/quality-alert/quality-alert.module';
import { CeoMessageModule } from './modules/ceo-message/ceo-message.module';
import { EmailTemplateModule } from './modules/email-template/email-template.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { PortalDataModule } from './modules/portal-data/portal-data.module';
import { TpmVisitorDataModule } from './modules/tpm-visitor-data/tpm-visitor-data.module';
import { HealthController } from './health.controller';

/**
 * Top-level module. Each Laminas module gets its own folder under src/modules/.
 *
 * Wave 0 (foundation): auth, acl, employee, db, upload.
 * Wave 1 (main portal + content): cms, menu, news, gallery, policy, activity,
 *                                 favourites/recentview, search.
 * Wave 2 (workflow apps): sop, audit, tpm, kaizen, activity-tracker, idea, oee, mpsheet, kpoint
 * Wave 3 (self-service): guest-house, carpool, visitors, sale-rent, training, tax, rnd, insurance, dni
 * Wave 4 (integrations + reporting): sap, report, audit-log middleware
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        // when running from apps/api (dist/main.js cwd)
        '../../.env',
        // when running from hero-compass root
        '.env',
      ],
    }),
    DbModule,
    UploadModule,
    ExcelModule,
    AuthModule,
    AclModule,
    EmployeeModule,
    // Wave 1
    CmsModule,
    MenuModule,
    NewsModule,
    GalleryModule,
    PolicyModule,
    ActivityModule,
    FavouritesModule,
    SearchModule,
    // Wave 2 (workflow apps — complete)
    SopModule,
    AuditModule,
    ActivityTrackerModule,
    TpmModule,
    KaizenModule,
    IdeaModule,
    OeeModule,
    MpsheetModule,
    // Wave 3 (self-service portals)
    GuestHouseModule,
    CarpoolModule,
    VisitorsModule,
    SaleRentModule,
    TrainingModule,
    TaxModule,
    // Wave 1 (additional)
    CeoMessageModule,
    EmailTemplateModule,
    MasterDataModule,
    PortalDataModule,
    TpmVisitorDataModule,
    // Wave 2 (additional)
    KpointModule,
    QualityAlertModule,
    // Wave 3 (additional)
    RndModule,
    InsuranceModule,
    DniModule,
    TcgModule,
    // Wave 4 (integrations + reporting)
    SapModule,
    ReportModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuditLogMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'v2/auth/login', method: RequestMethod.POST },
        { path: 'v2/auth/google', method: RequestMethod.GET },
        { path: 'v2/auth/google/callback', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
