import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { CompanyModel } from '../companies/domain/company.model';
import { ProjectModel } from '../projects/domain/project.model';
import { UserModel } from '../users/domain/user.model';
import { ClientCompanyEntity } from '../liens/lienUserCompany/domain/client-company.entity';
import { LicenseModel } from '../licenses/domain/license.model';
import { LicenseMachineModel } from '../licenses/domain/license-machine.model';
import { LicenseProjectModel } from '../licenses/domain/license-project.model';
import { DeliverableModel } from '../deliverables/domain/deliverable.model';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [CompanyModel, ProjectModel, UserModel, ClientCompanyEntity, LicenseModel, LicenseProjectModel, LicenseMachineModel, DeliverableModel],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
