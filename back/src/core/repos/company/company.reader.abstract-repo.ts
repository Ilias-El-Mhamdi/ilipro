import type { CompanyModel } from './company.entity';

export abstract class ICompanyReaderRepo {
  abstract findAll(): Promise<CompanyModel[]>;
  abstract findBySlug(slug: string): Promise<CompanyModel>;
  abstract findById(id: string): Promise<CompanyModel>;
}
