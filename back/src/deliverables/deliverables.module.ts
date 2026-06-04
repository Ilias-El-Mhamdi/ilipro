import { Module } from '@nestjs/common';
import { DeliverablesController } from './presentation/deliverables.controller';
import { DeliverablesService } from './application/deliverables.service';
import { DeliverableRepository } from './domain/deliverable.repository';
import { PrismaDeliverableRepository } from './infrastructure/prisma-deliverable.repository';
import { ProjectDeliverablesController } from '../projects/presentation/project-deliverables.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [DeliverablesController, ProjectDeliverablesController],
  providers: [
    DeliverablesService,
    { provide: DeliverableRepository, useClass: PrismaDeliverableRepository },
  ],
  exports: [DeliverablesService],
})
export class DeliverablesModule {}
