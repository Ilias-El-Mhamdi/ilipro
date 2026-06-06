import type { DeliverableModel } from './deliverable.model';

export abstract class DeliverableRepository {
  abstract findAll(): Promise<DeliverableModel[]>;
  abstract findByProjectId(projectId: string): Promise<DeliverableModel[]>;
  abstract findById(id: string): Promise<DeliverableModel | null>;
  abstract create(data: Omit<DeliverableModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliverableModel>;
  abstract delete(id: string): Promise<void>;
}
