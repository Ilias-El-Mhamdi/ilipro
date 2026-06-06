import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../users/domain/user.abtract-repository';
import { IUserCompanyRepository } from '../domain/user-company.abstract-repository';
import { UserModel } from '../../../users/domain/user.model';

@Injectable()
export class LinkUserUc {
  constructor(
    private readonly repo: IUserRepository,
    private readonly userCompanyRepo: IUserCompanyRepository,
  ) {}

  async createOrLink(firstName: string, lastName: string, email: string, companyId: string): Promise<UserModel> {
    let user = await this.repo.findByEmail(email);
    if (!user) {
      user = await this.repo.create(new UserModel(email, firstName, lastName));
    }
    const alreadyLinked = await this.userCompanyRepo.isLinked(user.id, companyId);
    if (!alreadyLinked) {
      await this.userCompanyRepo.link(user.id, companyId);
    }
    return user;
  }

  async linkToCompany(userId: string, companyId: string): Promise<void> {
    const alreadyLinked = await this.userCompanyRepo.isLinked(userId, companyId);
    if (!alreadyLinked) {
      await this.userCompanyRepo.link(userId, companyId);
    }
  }
}
