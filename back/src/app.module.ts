import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infra — infrastructure
import { DatabaseModule } from './infra/database/database.module';
import { RepoModule } from './infra/repos/repo.module';
import { JwtAuthGuard } from './infra/guards/jwt-auth.guard';
import { OtpRepository } from './infra/repos/otp/otp.repo';
import { ReadProfileRepository } from './infra/repos/readProfile/readProfile.repo';
import { ReadLicenseRepository } from './infra/repos/readLicense/readLicense.repo';
import { StripeRepo } from './infra/repos/payment/stripe.repo';

// Core — abstractions
import { IOtpRepository } from './core/repos/otp/otp.abstract-repo';
import { IReadProfileRepository } from './core/repos/readProfile/readProfile.abstract-repo';
import { IReadLicenseRepository } from './core/repos/readLicense/readLicense.abstract-repo';
import { IPaymentReadRepo } from './core/repos/payment/paymentRead.abstract-repo';

// Entities (TypeOrmModule.forFeature — pour OtpRepo, ReadProfileRepository, ReadLicenseRepository)
import { UserModel } from './core/repos/user/user.entity';
import { CompanyModel } from './core/repos/company/company.entity';
import { ProjectModel } from './core/repos/project/project.entity';
import { LicenseModel } from './core/repos/license/license.entity';
import { LicenseMachineModel } from './core/repos/license/license-machine.entity';
import { LicenseProjectModel } from './core/repos/license/license-project.entity';
import { UserCompanyEntity } from './core/repos/userCompany/user-company.entity';

// Core flows
import { JwtUc } from './core/flows/jwt/jwt.uc';
import { OtpUc } from './core/flows/jwt/otp.uc';
import { LinkUserUc } from './core/flows/linkUser/linkUser.uc';
import { DeliverablesUc } from './core/flows/deliverables/deliverables.uc';
import { ProjectsUc } from './core/flows/projects/projects.uc';
import { StripeUc } from './core/flows/payment/stripe.uc';

// Controllers — login
import { LoginController } from './infra/controllers/login/login.controller';

// Controllers — adminDashboard
import { CompaniesController } from './infra/controllers/adminDashboard/companies/companies.controller';
import { UsersController } from './infra/controllers/adminDashboard/users/users.controller';
import { ProjectsController } from './infra/controllers/adminDashboard/projects/projects.controller';
import { CompanyProjectsController } from './infra/controllers/adminDashboard/projects/company-projects.controller';
import { LicensesController } from './infra/controllers/adminDashboard/licenses/licenses.controller';
import { DeliverablesController } from './infra/controllers/adminDashboard/deliverables/deliverables.controller';
import { ProjectDeliverablesController } from './infra/controllers/adminDashboard/deliverables/project-deliverables.controller';
import { LinkUserController } from './infra/controllers/adminDashboard/linkUser/linkUser.controller';

// Controllers — userDashboard
import { ReadProfileController } from './infra/controllers/userDashboard/readProfile/readProfile.controller';
import { ReadLicenseController } from './infra/controllers/userDashboard/readLicense/readLicense.controller';

// Controllers — payment
import { StripeController } from './infra/controllers/payment/stripe.controller';
import { BillingPortalController } from './infra/controllers/payment/billingPortal.controller';

// Controllers — system
import { VersionController } from './infra/controllers/system/version.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RepoModule,
    // Entités pour les repos à injection TypeORM directe (OtpRepo, ReadProfile, ReadLicense)
    TypeOrmModule.forFeature([UserModel, CompanyModel, ProjectModel, LicenseModel, LicenseMachineModel, LicenseProjectModel, UserCompanyEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [
    LoginController,
    CompaniesController,
    UsersController,
    ProjectsController,
    CompanyProjectsController,
    LicensesController,
    DeliverablesController,
    ProjectDeliverablesController,
    LinkUserController,
    ReadProfileController,
    ReadLicenseController,
    StripeController,
    BillingPortalController,
    VersionController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    JwtAuthGuard,
    JwtUc,
    OtpUc,
    LinkUserUc,
    DeliverablesUc,
    ProjectsUc,
    StripeUc,
    { provide: IOtpRepository, useClass: OtpRepository },
    { provide: IReadProfileRepository, useClass: ReadProfileRepository },
    { provide: IReadLicenseRepository, useClass: ReadLicenseRepository },
    StripeRepo,
    { provide: IPaymentReadRepo, useExisting: StripeRepo },
  ],
})
export class AppModule {}
