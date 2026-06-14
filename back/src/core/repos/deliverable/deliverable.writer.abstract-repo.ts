import type { DeliverableEntity } from './deliverable.entity';

export abstract class IDeliverableWriterRepo {
  abstract create(data: Omit<DeliverableEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliverableEntity>;
  abstract delete(id: string): Promise<void>;
}
