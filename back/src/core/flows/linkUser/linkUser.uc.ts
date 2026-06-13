import { Injectable } from '@nestjs/common';
import { IUserWriterRepo } from '../../repos/user/user.writer.abstract-repo';
import { IUserCompanyWriterRepo } from '../../repos/userCompany/user-company.writer.abstract-repo';
import { IUserCompanyReaderRepo } from '../../repos/userCompany/user-company.reader.abstract-repo';
import { UserModel } from '../../repos/user/user.entity';

@Injectable()
export class LinkUserUc {
  constructor(
    private readonly userRepo: IUserWriterRepo,
    private readonly userCompanyWriterRepo: IUserCompanyWriterRepo,
    private readonly userCompanyReaderRepo: IUserCompanyReaderRepo,
  ) {}

  async createOrLink(firstName: string, lastName: string, email: string, companyId: string): Promise<UserModel> {
    let user = await this.userRepo.findByEmail(email);
    if (!user) {
      user = await this.userRepo.create(new UserModel(email, firstName, lastName));
    }
    const alreadyLinked = await this.userCompanyReaderRepo.isLinked(user.id, companyId);
    if (!alreadyLinked) {
      await this.userCompanyWriterRepo.link(user.id, companyId);
    }
    return user;
  }

  async linkToCompany(userId: string, companyId: string): Promise<void> {
    const alreadyLinked = await this.userCompanyReaderRepo.isLinked(userId, companyId);
    if (!alreadyLinked) {
      await this.userCompanyWriterRepo.link(userId, companyId);
    }
  }
}
