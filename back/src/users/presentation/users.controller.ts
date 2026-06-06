import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { IUserRepository } from '../domain/user.abtract-repository';
import { IUserCompanyRepository } from '../../liens/lienUserCompany/domain/user-company.abstract-repository';
import { ICompanyRepository } from '../../companies/domain/company.abstract-repository';
import { IProjectRepository } from '../../projects/domain/project.abstract-repository';
import { ILicenseRepository } from '../../licenses/domain/license.abstract-repository';
import { UserModel } from '../domain/user.model';

@Controller('users')
export class UsersController {
  constructor(
    private readonly repo: IUserRepository,
    @Inject(IUserCompanyRepository) private readonly userCompanyRepo: IUserCompanyRepository,
    @Inject(ICompanyRepository) private readonly companyRepo: ICompanyRepository,
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
    @Inject(ILicenseRepository) private readonly licenseRepo: ILicenseRepository,
  ) {}

  @Get()
  findAll() {
    return this.repo.findAll();
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const user = (await this.repo.findBySlug(slug)) as UserModel;
    const companyIds = await this.userCompanyRepo.findCompanyIdsByUserId(user.id);

    const companies = await Promise.all(
      companyIds.map(async (companyId) => {
        const [company, projects, license] = await Promise.all([
          this.companyRepo.findById(companyId),
          this.projectRepo.findByCompanyId(companyId),
          this.licenseRepo.findByUserAndCompany(user.id, companyId),
        ]);
        return { id: company.id, name: company.name, slug: company.slug, projects, license: license ?? null };
      }),
    );

    return { ...user, companies };
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.repo.findById(id);
  }

  @Post()
  create(@Body('firstName') firstName: string, @Body('lastName') lastName: string, @Body('email') email: string) {
    return this.repo.create(new UserModel(email, firstName, lastName));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('firstName') firstName: string, @Body('lastName') lastName: string) {
    return this.repo.update(id, { firstName, lastName });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.repo.delete(id);
  }
}
