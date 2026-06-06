import type { UserModel } from '../../../users/domain/user.model';

export abstract class IUserCompanyRepository {
  abstract findUsersByCompanyId(companyId: string): Promise<UserModel[]>;

  abstract findCompanyIdsByUserId(userId: string): Promise<string[]>;

  abstract link(userId: string, companyId: string): Promise<void>;

  abstract unlink(userId: string, companyId: string): Promise<void>;

  abstract isLinked(userId: string, companyId: string): Promise<boolean>;
}
