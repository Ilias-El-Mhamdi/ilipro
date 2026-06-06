import type { DeliverableModel } from './deliverable.model';

export class DeliverableEntity {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  storageKey: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;

  static fromModel(model: DeliverableModel): DeliverableEntity {
    return Object.assign(new DeliverableEntity(), model);
  }

  toModel(): DeliverableModel {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      mimeType: this.mimeType,
      size: this.size,
      storageKey: this.storageKey,
      projectId: this.projectId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
