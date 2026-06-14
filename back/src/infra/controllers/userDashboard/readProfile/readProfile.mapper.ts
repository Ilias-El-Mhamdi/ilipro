import type { UserCompanySection, CompanyMember } from 'platform/contracts/userDashboard/readProfile/readProfile.response';
import { ReadProfileResponse } from 'platform/contracts/userDashboard/readProfile/readProfile.response';
import type { UserProfile, CompanyProfile, MemberProfile } from '../../../../core/repos/readProfile/readProfile.abstract-repo';
import { LicenseMapper } from '../../../mappers/license.mapper';
import { ProjectMapper } from '../../../mappers/project.mapper';

export class ReadProfileMapper {
  static toResponse(profile: UserProfile): ReadProfileResponse {
    return Object.assign(new ReadProfileResponse(), {
      id: profile.id,
      slug: profile.slug,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      stripeCustomerId: profile.stripeCustomerId,
      createdAt: profile.createdAt.toISOString(),
      companies: profile.companies.map((c) => ReadProfileMapper.toCompanySection(c)),
    });
  }

  private static toCompanySection(company: CompanyProfile): UserCompanySection {
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      license: company.license ? LicenseMapper.toResponse(company.license) : null,
      projects: ProjectMapper.toResponseList(company.projects),
      members: company.members.map((m) => ReadProfileMapper.toMember(m)),
    };
  }

  private static toMember(member: MemberProfile): CompanyMember {
    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      license: member.license ? LicenseMapper.toResponse(member.license) : null,
    };
  }
}
