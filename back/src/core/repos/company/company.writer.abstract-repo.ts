import type { CompanyEntity } from './company.entity';

export abstract class ICompanyWriterRepo {
  abstract create(name: string): Promise<CompanyEntity>;
  abstract update(slug: string, name: string): Promise<CompanyEntity>;
  abstract updateName(slug: string, name: string): Promise<CompanyEntity>;
  abstract delete(slug: string): Promise<void>;
}
