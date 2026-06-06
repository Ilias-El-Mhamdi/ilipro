import type { ProjectModel } from './project.model';

export abstract class IProjectRepository {
  abstract findAll(): Promise<ProjectModel[]>;

  abstract findByCompanyId(companyId: string): Promise<ProjectModel[]>;

  abstract findBySlug(companyId: string, slug: string): Promise<ProjectModel | null>;

  abstract findById(id: string): Promise<ProjectModel>;

  abstract create(
    name: string,
    companyId: string,
    appUrl?: string | null,
    docsUrl?: string | null,
    changelogUrl?: string | null,
  ): Promise<ProjectModel>;

  abstract updateProject(id: string, data: Partial<Pick<ProjectModel, 'name' | 'appUrl' | 'docsUrl' | 'changelogUrl'>>): Promise<ProjectModel>;

  abstract delete(id: string): Promise<void>;
}
