import type { ProjectModel } from './project.entity';

export abstract class IProjectReaderRepo {
  abstract findAll(): Promise<ProjectModel[]>;
  abstract findByCompanyId(companyId: string): Promise<ProjectModel[]>;
  abstract findBySlug(companyId: string, slug: string): Promise<ProjectModel | null>;
  abstract findById(id: string): Promise<ProjectModel>;
}
