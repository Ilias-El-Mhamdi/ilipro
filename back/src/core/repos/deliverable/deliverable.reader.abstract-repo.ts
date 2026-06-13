import type { DeliverableModel } from './deliverable.entity';

export abstract class IDeliverableReaderRepo {
  abstract findAll(): Promise<DeliverableModel[]>;
  abstract findByProjectId(projectId: string): Promise<DeliverableModel[]>;
  abstract findById(id: string): Promise<DeliverableModel>;
}
