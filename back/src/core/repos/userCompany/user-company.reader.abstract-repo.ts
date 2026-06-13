import type { UserModel } from '../user/user.entity';

export abstract class IUserCompanyReaderRepo {
  abstract findUsersByCompanyId(companyId: string): Promise<UserModel[]>;
  abstract findCompanyIdsByUserId(userId: string): Promise<string[]>;
  abstract isLinked(userId: string, companyId: string): Promise<boolean>;
}
