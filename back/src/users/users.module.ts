import { Module } from '@nestjs/common';
import { UsersController } from './presentation/users.controller';
import { UsersService } from './application/users.service';
import { UserRepository } from './domain/user.repository';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { CompanyUsersController } from '../companies/presentation/company-users.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [CompaniesModule],
  controllers: [UsersController, CompanyUsersController],
  providers: [
    UsersService,
    { provide: UserRepository, useClass: PrismaUserRepository },
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
