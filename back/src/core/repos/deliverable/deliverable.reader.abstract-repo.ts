import type { DeliverableEntity } from './deliverable.entity';

export abstract class IDeliverableReaderRepo {
  abstract findAll(): Promise<DeliverableEntity[]>;
  abstract findByProjectId(projectId: string): Promise<DeliverableEntity[]>;
  abstract findById(id: string): Promise<DeliverableEntity>;
}
