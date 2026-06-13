import type { ProjectModel } from './project.entity';

export abstract class IProjectWriterRepo {
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
