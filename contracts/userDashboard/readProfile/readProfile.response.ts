import type { License } from "../../shared/license";
import type { Project } from "../../shared/project";

export interface CompanyMember {
  id: string;
  firstName: string | null;
  lastName: string | null;
  license: License | null;
}

export interface UserCompanySection {
  id: string;
  name: string;
  slug: string;
  license: License | null;
  projects: Project[];
  members: CompanyMember[];
}

export class ReadProfileResponse {
  declare id: string;
  declare slug: string;
  declare firstName: string | null;
  declare lastName: string | null;
  declare email: string;
  declare stripeCustomerId: string | null;
  declare companies: UserCompanySection[];
  declare createdAt: string;

  static fromJson(json: unknown): ReadProfileResponse {
    return json as ReadProfileResponse;
  }
}
