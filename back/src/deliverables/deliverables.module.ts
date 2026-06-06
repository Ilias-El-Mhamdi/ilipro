import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliverablesController } from './presentation/deliverables.controller';
import { DeliverablesUc } from './useCase/deliverables.uc';
import { IDeliverableRepository } from './domain/deliverable.repository';
import { TypeOrmDeliverableRepository } from './infrastructure/typeorm-deliverable.repository';
import { DeliverableModel } from './domain/deliverable.model';
import { ProjectDeliverablesController } from '../projects/presentation/project-deliverables.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliverableModel]), StorageModule],
  controllers: [DeliverablesController, ProjectDeliverablesController],
  providers: [
    DeliverablesUc,
    { provide: IDeliverableRepository, useClass: TypeOrmDeliverableRepository },
  ],
  exports: [DeliverablesUc, IDeliverableRepository],
})
export class DeliverablesModule {}
