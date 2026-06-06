import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModel } from '../companies/domain/company.model';
import { ProjectModel } from '../projects/domain/project.model';
import { UserModel } from '../users/domain/user.model';
import { ClientCompanyEntity } from '../liens/lienUserCompany/client-company.entity';
import { LicenseModel, LicenseProjectModel, LicenseMachineModel } from '../licenses/domain/license.model';
import { DeliverableModel } from '../deliverables/domain/deliverable.model';
import { RenameClientToUser1749200000000 } from './migrations/1749200000000-RenameClientToUser';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        CompanyModel,
        ProjectModel,
        UserModel,
        ClientCompanyEntity,
        LicenseModel,
        LicenseProjectModel,
        LicenseMachineModel,
        DeliverableModel,
      ],
      migrations: [RenameClientToUser1749200000000],
      synchronize: false,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
