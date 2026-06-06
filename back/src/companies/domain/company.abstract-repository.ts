import type { CompanyModel } from './company.model';

export abstract class ICompanyRepository {
  abstract findAll(): Promise<CompanyModel[]>;
  abstract findBySlug(slug: string): Promise<CompanyModel>;
  abstract findById(id: string): Promise<CompanyModel>;
  abstract create(name: string): Promise<CompanyModel>;
  abstract update(slug: string, name: string): Promise<CompanyModel>;
  abstract updateName(slug: string, name: string): Promise<CompanyModel>;
  abstract delete(slug: string): Promise<void>;
}
