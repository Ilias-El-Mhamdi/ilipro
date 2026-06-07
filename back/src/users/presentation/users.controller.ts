import { Body, Controller, Delete, ForbiddenException, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { IUserRepository } from '../domain/user.abtract-repository';
import { IUserCompanyRepository } from '../../liens/lienUserCompany/domain/user-company.abstract-repository';
import { ICompanyRepository } from '../../companies/domain/company.abstract-repository';
import { IProjectRepository } from '../../projects/domain/project.abstract-repository';
import { ILicenseRepository } from '../../licenses/domain/license.abstract-repository';
import { UserModel } from '../domain/user.model';
import { AdminGuard } from '../../auth/guards/admin.guard';
import type { JwtPayload } from '../../auth/domain/jwt-payload';

@Controller('users')
export class UsersController {
  constructor(
    private readonly repo: IUserRepository,
    @Inject(IUserCompanyRepository) private readonly userCompanyRepo: IUserCompanyRepository,
    @Inject(ICompanyRepository) private readonly companyRepo: ICompanyRepository,
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
    @Inject(ILicenseRepository) private readonly licenseRepo: ILicenseRepository,
  ) {}

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.repo.findAll();
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    const caller = req['user'] as JwtPayload;
    if (!caller.isAdmin && caller.slug !== slug) throw new ForbiddenException();

    const user = (await this.repo.findBySlug(slug)) as UserModel;
    const companyIds = await this.userCompanyRepo.findCompanyIdsByUserId(user.id);

    const companies = await Promise.all(
      companyIds.map(async (companyId) => {
        const [company, projects, license, companyUsers] = await Promise.all([
          this.companyRepo.findById(companyId),
          this.projectRepo.findByCompanyId(companyId),
          this.licenseRepo.findByUserAndCompany(user.id, companyId),
          this.userCompanyRepo.findUsersByCompanyId(companyId),
        ]);
        const members = await Promise.all(
          companyUsers.map(async (u) => {
            const memberLicense = await this.licenseRepo.findByUserAndCompany(u.id, companyId);
            return { id: u.id, firstName: u.firstName, lastName: u.lastName, license: memberLicense ?? null };
          }),
        );
        return { id: company.id, name: company.name, slug: company.slug, projects, license: license ?? null, members };
      }),
    );

    return { ...user, companies };
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.repo.findById(id);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body('firstName') firstName: string, @Body('lastName') lastName: string, @Body('email') email: string) {
    return this.repo.create(new UserModel(email, firstName, lastName));
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body('firstName') firstName: string, @Body('lastName') lastName: string) {
    return this.repo.update(id, { firstName, lastName });
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.repo.delete(id);
  }
}
