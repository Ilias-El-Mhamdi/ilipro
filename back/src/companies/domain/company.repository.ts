import type { CompanyModel } from './company.model';

export abstract class ICompanyRepository {
  abstract findAll(): Promise<CompanyModel[]>;
  abstract findBySlug(slug: string): Promise<CompanyModel | null>;
  abstract findById(id: string): Promise<CompanyModel | null>;
  abstract create(data: Pick<CompanyModel, 'name' | 'slug'>): Promise<CompanyModel>;
  abstract update(id: string, data: Pick<CompanyModel, 'name' | 'slug'>): Promise<CompanyModel>;
  abstract delete(id: string): Promise<void>;
}
