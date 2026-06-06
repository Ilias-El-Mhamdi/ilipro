import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './presentation/users.controller';
import { LinkUserUc } from '../liens/useCase/linkUser.uc';
import { IUserRepository } from './domain/user.abtract-repository';
import { IClientCompanyRepository } from '../liens/lienUserCompany/client-company.repository';
import { UserRepository } from './infrastructure/user.repository';
import { TypeOrmClientCompanyRepository } from '../liens/lienUserCompany/typeorm-client-company.repository';
import { UserModel } from './domain/user.model';
import { ClientCompanyEntity } from '../liens/lienUserCompany/client-company.entity';
import { CompanyUsersController } from '../companies/presentation/company-users.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel, ClientCompanyEntity]), CompaniesModule],
  controllers: [UsersController, CompanyUsersController],
  providers: [
    LinkUserUc,
    { provide: IUserRepository, useClass: UserRepository },
    { provide: IClientCompanyRepository, useClass: TypeOrmClientCompanyRepository },
  ],
  exports: [LinkUserUc, IUserRepository, IClientCompanyRepository],
})
export class UsersModule {}
