import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../users/domain/user.abtract-repository';
import { IClientCompanyRepository } from '../lienUserCompany/client-company.repository';
import { UserModel } from '../../users/domain/user.model';

@Injectable()
export class LinkUserUc {
  constructor(
    private readonly repo: IUserRepository,
    private readonly clientCompanyRepo: IClientCompanyRepository,
  ) {}

  async createOrLink(firstName: string, lastName: string, email: string, companyId: string): Promise<UserModel> {
    let user = await this.repo.findByEmail(email);
    if (!user) {
      user = await this.repo.create(new UserModel(email, firstName, lastName));
    }
    const alreadyLinked = await this.clientCompanyRepo.isLinked(user.id, companyId);
    if (!alreadyLinked) {
      await this.clientCompanyRepo.link(user.id, companyId);
    }
    return user;
  }

  async linkToCompany(userId: string, companyId: string): Promise<void> {
    const alreadyLinked = await this.clientCompanyRepo.isLinked(userId, companyId);
    if (!alreadyLinked) {
      await this.clientCompanyRepo.link(userId, companyId);
    }
  }
}
