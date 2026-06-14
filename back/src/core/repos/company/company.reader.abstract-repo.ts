import type { CompanyEntity } from './company.entity';

export abstract class ICompanyReaderRepo {
  abstract findAll(): Promise<CompanyEntity[]>;
  abstract findBySlug(slug: string): Promise<CompanyEntity>;
  abstract findById(id: string): Promise<CompanyEntity>;
}
