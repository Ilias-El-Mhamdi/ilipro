import type { CompanyModel } from './company.entity';

export abstract class ICompanyWriterRepo {
  abstract create(name: string): Promise<CompanyModel>;
  abstract update(slug: string, name: string): Promise<CompanyModel>;
  abstract updateName(slug: string, name: string): Promise<CompanyModel>;
  abstract delete(slug: string): Promise<void>;
}
