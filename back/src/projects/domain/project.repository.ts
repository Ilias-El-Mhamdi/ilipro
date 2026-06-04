import type { Project } from './project.entity';

export abstract class ProjectRepository {
  abstract findAll(): Promise<Project[]>;
  abstract findByCompanyId(companyId: string): Promise<Project[]>;
  abstract findBySlug(companyId: string, slug: string): Promise<Project | null>;
  abstract findById(id: string): Promise<Project | null>;
  abstract create(name: string, slug: string, companyId: string): Promise<Project>;
  abstract update(id: string, name: string, slug: string): Promise<Project>;
  abstract delete(id: string): Promise<void>;
}
