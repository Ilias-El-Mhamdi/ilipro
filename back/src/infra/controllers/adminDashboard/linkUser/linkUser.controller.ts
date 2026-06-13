import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { LinkUserUc } from '../../../../core/flows/linkUser/linkUser.uc';
import { IUserWriterRepo } from '../../../../core/repos/user/user.writer.abstract-repo';
import { IUserCompanyReaderRepo } from '../../../../core/repos/userCompany/user-company.reader.abstract-repo';
import { IUserCompanyWriterRepo } from '../../../../core/repos/userCompany/user-company.writer.abstract-repo';
import { ICompanyReaderRepo } from '../../../../core/repos/company/company.reader.abstract-repo';
import { ILicenseReaderRepo } from '../../../../core/repos/license/license.reader.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('companies/:companySlug/users')
export class LinkUserController {
  constructor(
    private readonly linkUserUc: LinkUserUc,
    @Inject(IUserWriterRepo) private readonly userRepo: IUserWriterRepo,
    @Inject(IUserCompanyReaderRepo) private readonly userCompanyReaderRepo: IUserCompanyReaderRepo,
    @Inject(IUserCompanyWriterRepo) private readonly userCompanyWriterRepo: IUserCompanyWriterRepo,
    @Inject(ICompanyReaderRepo) private readonly companyRepo: ICompanyReaderRepo,
    @Inject(ILicenseReaderRepo) private readonly licenseRepo: ILicenseReaderRepo,
  ) {}

  @Get()
  async findByCompany(@Param('companySlug') companySlug: string) {
    const company = await this.companyRepo.findBySlug(companySlug);
    const users = await this.userCompanyReaderRepo.findUsersByCompanyId(company.id);

    return Promise.all(
      users.map(async (user) => {
        const license = await this.licenseRepo.findByUserAndCompany(user.id, company.id);
        return { ...user, license: license ?? null };
      }),
    );
  }

  @Post()
  async createOrLink(
    @Param('companySlug') companySlug: string,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
  ) {
    const company = await this.companyRepo.findBySlug(companySlug);
    return this.linkUserUc.createOrLink(firstName, lastName, email, company.id);
  }

  @Put(':userId')
  update(@Param('userId') userId: string, @Body('firstName') firstName: string, @Body('lastName') lastName: string) {
    return this.userRepo.update(userId, { firstName, lastName });
  }

  @Patch(':userId/link')
  async linkExisting(@Param('companySlug') companySlug: string, @Param('userId') userId: string) {
    const company = await this.companyRepo.findBySlug(companySlug);
    return this.linkUserUc.linkToCompany(userId, company.id);
  }

  @Delete(':userId')
  async unlink(@Param('companySlug') companySlug: string, @Param('userId') userId: string) {
    const company = await this.companyRepo.findBySlug(companySlug);
    return this.userCompanyWriterRepo.unlink(userId, company.id);
  }
}
