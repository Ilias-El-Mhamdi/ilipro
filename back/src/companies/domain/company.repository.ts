import type { Company } from './company.entity';

export abstract class CompanyRepository {
  abstract findAll(): Promise<Company[]>;
  abstract findBySlug(slug: string): Promise<Company | null>;
  abstract findById(id: string): Promise<Company | null>;
  abstract create(name: string, slug: string): Promise<Company>;
  abstract update(id: string, name: string, slug: string): Promise<Company>;
  abstract delete(id: string): Promise<void>;
}
