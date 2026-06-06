import type { ProjectModel } from './project.model';

export abstract class ProjectRepository {
  abstract findAll(): Promise<ProjectModel[]>;
  abstract findByCompanyId(companyId: string): Promise<ProjectModel[]>;
  abstract findBySlug(companyId: string, slug: string): Promise<ProjectModel | null>;
  abstract findById(id: string): Promise<ProjectModel | null>;
  abstract create(data: Omit<ProjectModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectModel>;
  abstract update(
    id: string,
    data: Partial<Pick<ProjectModel, 'name' | 'appUrl' | 'docsUrl' | 'changelogUrl'>>,
  ): Promise<ProjectModel>;
  abstract delete(id: string): Promise<void>;
}
