import type { ProjectModel } from './project.model';

export class ProjectEntity {
  id: string;
  name: string;
  slug: string;
  appUrl: string | null;
  docsUrl: string | null;
  changelogUrl: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;

  static fromModel(model: ProjectModel): ProjectEntity {
    const entity = new ProjectEntity();
    entity.id = model.id;
    entity.name = model.name;
    entity.slug = model.slug;
    entity.appUrl = model.appUrl;
    entity.docsUrl = model.docsUrl;
    entity.changelogUrl = model.changelogUrl;
    entity.companyId = model.companyId;
    entity.createdAt = model.createdAt;
    entity.updatedAt = model.updatedAt;
    return entity;
  }

  toModel(): ProjectModel {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      appUrl: this.appUrl,
      docsUrl: this.docsUrl,
      changelogUrl: this.changelogUrl,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
