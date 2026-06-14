import { Company } from 'platform/contracts/shared/company';
import type { CompanyEntity } from '../../core/repos/company/company.entity';

export class CompanyMapper {
  static toResponse(entity: CompanyEntity): Company {
    return Object.assign(new Company(), {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      createdAt: entity.createdAt.toISOString(),
    });
  }

  static toResponseList(entities: CompanyEntity[]): Company[] {
    return entities.map((e) => CompanyMapper.toResponse(e));
  }
}
