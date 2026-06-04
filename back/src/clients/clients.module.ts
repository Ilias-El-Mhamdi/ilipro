import { Module } from '@nestjs/common';
import { ClientsController } from './presentation/clients.controller';
import { ClientsService } from './application/clients.service';
import { ClientRepository } from './domain/client.repository';
import { PrismaClientRepository } from './infrastructure/prisma-client.repository';
import { ProjectClientsController } from '../projects/presentation/project-clients.controller';

@Module({
  controllers: [ClientsController, ProjectClientsController],
  providers: [
    ClientsService,
    { provide: ClientRepository, useClass: PrismaClientRepository },
  ],
  exports: [ClientsService],
})
export class ClientsModule {}
