import { Module } from '@nestjs/common';
import { ClientsController } from './presentation/clients.controller';
import { ClientsService } from './application/clients.service';
import { ClientRepository } from './domain/client.repository';
import { PrismaClientRepository } from './infrastructure/prisma-client.repository';
import { CompanyClientsController } from '../companies/presentation/company-clients.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [CompaniesModule],
  controllers: [ClientsController, CompanyClientsController],
  providers: [
    ClientsService,
    { provide: ClientRepository, useClass: PrismaClientRepository },
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
