// Read model spécifique au userDashboard : jointure multi-entités (User, Company, Project, License).
// Ce n'est pas un repo CRUD standard — il construit une vue dénormalisée pour un seul endpoint.
// Placé dans core/repos/ pour respecter le pattern abstraction/implémentation du projet.
import type { LicenseModel } from '../license/license.entity';
import type { ProjectModel } from '../project/project.entity';

export interface MemberProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  license: LicenseModel | null;
}

export interface CompanyProfile {
  id: string;
  name: string;
  slug: string;
  projects: ProjectModel[];
  license: LicenseModel | null;
  members: MemberProfile[];
}

export interface UserProfile {
  id: string;
  slug: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  isAdmin: boolean;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  companies: CompanyProfile[];
}

export abstract class IReadProfileRepository {
  abstract findBySlug(slug: string): Promise<UserProfile>;
}
