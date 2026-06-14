import { User } from 'platform/contracts/shared/user';
import { CompanyUser } from 'platform/contracts/adminDashboard/linkUser/listCompanyUsers/listCompanyUsers.response';
import type { UserEntity } from '../../core/repos/user/user.entity';
import type { LicenseEntity } from '../../core/repos/license/license.entity';
import { LicenseMapper } from './license.mapper';

export class UserMapper {
  static toResponse(entity: UserEntity): User {
    return Object.assign(new User(), {
      id: entity.id,
      slug: entity.slug,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      stripeCustomerId: entity.stripeCustomerId,
      createdAt: entity.createdAt.toISOString(),
    });
  }

  static toResponseList(entities: UserEntity[]): User[] {
    return entities.map((e) => UserMapper.toResponse(e));
  }

  static toCompanyUser(user: UserEntity, license: LicenseEntity | null): CompanyUser {
    return Object.assign(new CompanyUser(), {
      ...UserMapper.toResponse(user),
      license: license ? LicenseMapper.toResponse(license) : null,
    });
  }
}
