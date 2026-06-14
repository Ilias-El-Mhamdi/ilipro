import { Project } from 'contracts/shared/project';
import type { ProjectEntity } from '../../core/repos/project/project.entity';

export class ProjectMapper {
  static toResponse(entity: ProjectEntity): Project {
    return Object.assign(new Project(), {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      appUrl: entity.appUrl,
      docsUrl: entity.docsUrl,
      changelogUrl: entity.changelogUrl,
      companyId: entity.companyId,
      createdAt: entity.createdAt.toISOString(),
    });
  }

  static toResponseList(entities: ProjectEntity[]): Project[] {
    return entities.map((e) => ProjectMapper.toResponse(e));
  }
}
