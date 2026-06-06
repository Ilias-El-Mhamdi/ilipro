import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './presentation/users.controller';
import { LinkUserUc } from '../liens/lienUserCompany/useCase/linkUser.uc';
import { IUserRepository } from './domain/user.abtract-repository';
import { IClientCompanyRepository } from '../liens/lienUserCompany/domain/client-company.abstract-repository';
import { UserRepository } from './infrastructure/user.repository';
import { ClientCompanyRepository } from '../liens/lienUserCompany/infra/client-company.repository';
import { UserModel } from './domain/user.model';
import { ClientCompanyEntity } from '../liens/lienUserCompany/domain/client-company.entity';
import { CompanyUsersController } from '../companies/presentation/company-users.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel, ClientCompanyEntity]), CompaniesModule],
  controllers: [UsersController, CompanyUsersController],
  providers: [
    LinkUserUc,
    { provide: IUserRepository, useClass: UserRepository },
    { provide: IClientCompanyRepository, useClass: ClientCompanyRepository },
  ],
  exports: [LinkUserUc, IUserRepository, IClientCompanyRepository],
})
export class UsersModule {}
