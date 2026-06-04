import type { Deliverable } from './deliverable.entity';

export interface CreateDeliverableDto {
  name: string;
  url: string;
  mimeType: string;
  size: number;
  storageKey: string;
  projectId: string;
}

export abstract class DeliverableRepository {
  abstract findAll(): Promise<Deliverable[]>;
  abstract findByProjectId(projectId: string): Promise<Deliverable[]>;
  abstract findById(id: string): Promise<Deliverable | null>;
  abstract create(dto: CreateDeliverableDto): Promise<Deliverable>;
  abstract delete(id: string): Promise<void>;
}
