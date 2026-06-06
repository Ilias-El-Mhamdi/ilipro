import type { CompanyModel } from './company.model';

export class CompanyEntity {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;

  static fromModel(model: CompanyModel): CompanyEntity {
    const entity = new CompanyEntity();
    entity.id = model.id;
    entity.name = model.name;
    entity.slug = model.slug;
    entity.createdAt = model.createdAt;
    entity.updatedAt = model.updatedAt;
    return entity;
  }

  toModel(): CompanyModel {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
