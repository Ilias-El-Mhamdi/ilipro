import type { ProjectEntity } from './project.entity';

export abstract class IProjectWriterRepo {
  abstract create(
    name: string,
    companyId: string,
    appUrl?: string | null,
    docsUrl?: string | null,
    changelogUrl?: string | null,
  ): Promise<ProjectEntity>;

  abstract updateProject(id: string, data: Partial<Pick<ProjectEntity, 'name' | 'appUrl' | 'docsUrl' | 'changelogUrl'>>): Promise<ProjectEntity>;

  abstract delete(id: string): Promise<void>;
}
