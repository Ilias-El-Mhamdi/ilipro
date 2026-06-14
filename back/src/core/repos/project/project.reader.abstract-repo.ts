import type { ProjectEntity } from './project.entity';

export abstract class IProjectReaderRepo {
  abstract findAll(): Promise<ProjectEntity[]>;
  abstract findByCompanyId(companyId: string): Promise<ProjectEntity[]>;
  abstract findBySlug(companyId: string, slug: string): Promise<ProjectEntity | null>;
  abstract findById(id: string): Promise<ProjectEntity>;
}
