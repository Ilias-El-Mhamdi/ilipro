import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IReadProfileRepository, UserProfile } from '../../../core/repos/readProfile/readProfile.abstract-repo';
import { UserModel } from '../../../core/repos/user/user.entity';
import { UserCompanyEntity } from '../../../core/repos/userCompany/user-company.entity';
import { CompanyModel } from '../../../core/repos/company/company.entity';
import { ProjectModel } from '../../../core/repos/project/project.entity';
import { LicenseModel } from '../../../core/repos/license/license.entity';

const licenseRelations = { projectAccess: true, machines: true };
const licenseOrder = { machines: { activatedAt: 'ASC' as const } };

@Injectable()
export class ReadProfileRepository implements IReadProfileRepository {
  constructor(
    @InjectRepository(UserModel) private readonly userRepo: Repository<UserModel>,
    @InjectRepository(UserCompanyEntity) private readonly ucRepo: Repository<UserCompanyEntity>,
    @InjectRepository(CompanyModel) private readonly companyRepo: Repository<CompanyModel>,
    @InjectRepository(ProjectModel) private readonly projectRepo: Repository<ProjectModel>,
    @InjectRepository(LicenseModel) private readonly licenseRepo: Repository<LicenseModel>,
  ) {}

  async findBySlug(slug: string): Promise<UserProfile> {
    const user = await this.userRepo.findOne({ where: { slug } });
    if (!user) throw new NotFoundException(`User "${slug}" not found`);

    const links = await this.ucRepo.find({ where: { userId: user.id } });
    const companyIds = links.map((l) => l.companyId);

    const companies = await Promise.all(
      companyIds.map(async (companyId) => {
        const [company, projects, license, memberLinks] = await Promise.all([
          this.companyRepo.findOne({ where: { id: companyId } }),
          this.projectRepo.find({ where: { companyId }, order: { createdAt: 'DESC' } }),
          this.licenseRepo.findOne({
            where: { userId: user.id, companyId },
            relations: licenseRelations,
            order: licenseOrder,
          }),
          this.ucRepo.find({ where: { companyId } }),
        ]);

        if (!company) return null;

        const memberUserIds = memberLinks.map((l) => l.userId);
        const memberUsers = memberUserIds.length
          ? await this.userRepo.createQueryBuilder('u').where('u.id IN (:...ids)', { ids: memberUserIds }).getMany()
          : [];

        const members = await Promise.all(
          memberUsers.map(async (u) => {
            const memberLicense = await this.licenseRepo.findOne({
              where: { userId: u.id, companyId },
              relations: licenseRelations,
              order: licenseOrder,
            });
            return { id: u.id, firstName: u.firstName, lastName: u.lastName, license: memberLicense ?? null };
          }),
        );

        return { id: company.id, name: company.name, slug: company.slug, projects, license: license ?? null, members };
      }),
    );

    const { otp, otpExpiry, otpAttempts, otpRequestedAt, ...safeUser } = user as UserModel & Record<string, unknown>;

    return {
      ...safeUser,
      id: user.id,
      slug: user.slug,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      companies: companies.filter(Boolean) as NonNullable<(typeof companies)[number]>[],
    };
  }
}
