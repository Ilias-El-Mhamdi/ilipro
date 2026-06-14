import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { CompanyEntity } from '../../core/repos/company/company.entity';
import { ProjectEntity } from '../../core/repos/project/project.entity';
import { UserEntity } from '../../core/repos/user/user.entity';
import { UserCompanyEntity } from '../../core/repos/userCompany/user-company.entity';
import { LicenseEntity } from '../../core/repos/license/license.entity';
import { LicenseMachineEntity } from '../../core/repos/license/license-machine.entity';
import { LicenseProjectEntity } from '../../core/repos/license/license-project.entity';
import { DeliverableEntity } from '../../core/repos/deliverable/deliverable.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    CompanyEntity,
    ProjectEntity,
    UserEntity,
    UserCompanyEntity,
    LicenseEntity,
    LicenseProjectEntity,
    LicenseMachineEntity,
    DeliverableEntity,
  ],
  migrations: ['src/infra/database/migrations/*.ts'],
  synchronize: false,
});
