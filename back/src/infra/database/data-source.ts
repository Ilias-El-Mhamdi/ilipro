import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { CompanyModel } from '../../core/repos/company/company.entity';
import { ProjectModel } from '../../core/repos/project/project.entity';
import { UserModel } from '../../core/repos/user/user.entity';
import { UserCompanyEntity } from '../../core/repos/userCompany/user-company.entity';
import { LicenseModel } from '../../core/repos/license/license.entity';
import { LicenseMachineModel } from '../../core/repos/license/license-machine.entity';
import { LicenseProjectModel } from '../../core/repos/license/license-project.entity';
import { DeliverableModel } from '../../core/repos/deliverable/deliverable.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [CompanyModel, ProjectModel, UserModel, UserCompanyEntity, LicenseModel, LicenseProjectModel, LicenseMachineModel, DeliverableModel],
  migrations: ['src/infra/database/migrations/*.ts'],
  synchronize: false,
});
