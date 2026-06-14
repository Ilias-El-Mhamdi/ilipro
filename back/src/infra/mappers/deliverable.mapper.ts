import { Deliverable } from 'platform/contracts/shared/deliverable';
import type { DeliverableEntity } from '../../core/repos/deliverable/deliverable.entity';

export class DeliverableMapper {
  static toResponse(entity: DeliverableEntity): Deliverable {
    return Object.assign(new Deliverable(), {
      id: entity.id,
      name: entity.name,
      url: entity.url,
      mimeType: entity.mimeType,
      size: entity.size,
      projectId: entity.projectId,
      createdAt: entity.createdAt.toISOString(),
    });
  }

  static toResponseList(entities: DeliverableEntity[]): Deliverable[] {
    return entities.map((e) => DeliverableMapper.toResponse(e));
  }
}
