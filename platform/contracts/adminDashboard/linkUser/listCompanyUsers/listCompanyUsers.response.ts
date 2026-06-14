import { User } from "../../../shared/user";
import type { License } from "../../../shared/license";

export class CompanyUser extends User {
  declare license: License | null;

  static fromJson(json: unknown): CompanyUser {
    return json as CompanyUser;
  }

  static fromJsonList(json: unknown): CompanyUser[] {
    return json as CompanyUser[];
  }
}
