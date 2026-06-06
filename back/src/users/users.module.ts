import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './presentation/users.controller';
import { LinkUserUc } from '../liens/lienUserCompany/useCase/linkUser.uc';
import { IUserRepository } from './domain/user.abtract-repository';
import { IUserCompanyRepository } from '../liens/lienUserCompany/domain/user-company.abstract-repository';
import { UserRepository } from './infrastructure/user.repository';
import { UserCompanyRepository } from '../liens/lienUserCompany/infra/user-company.repository';
import { UserModel } from './domain/user.model';
import { UserCompanyEntity } from '../liens/lienUserCompany/domain/user-company.entity';
import { CompanyUsersController } from '../companies/presentation/company-users.controller';
import { CompaniesModule } from '../companies/companies.module';
import { LicensesModule } from '../licenses/licenses.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel, UserCompanyEntity]), CompaniesModule, LicensesModule, ProjectsModule],
  controllers: [UsersController, CompanyUsersController],
  providers: [
    LinkUserUc,
    { provide: IUserRepository, useClass: UserRepository },
    { provide: IUserCompanyRepository, useClass: UserCompanyRepository },
  ],
  exports: [LinkUserUc, IUserRepository, IUserCompanyRepository],
})
export class UsersModule {}
