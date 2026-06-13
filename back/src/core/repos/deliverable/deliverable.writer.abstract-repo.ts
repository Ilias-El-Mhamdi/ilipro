import type { DeliverableModel } from './deliverable.entity';

export abstract class IDeliverableWriterRepo {
  abstract create(data: Omit<DeliverableModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliverableModel>;
  abstract delete(id: string): Promise<void>;
}
