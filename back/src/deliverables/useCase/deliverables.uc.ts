import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IDeliverableRepository } from '../domain/deliverable.abstract-repository';
import { StorageService } from '../../storage/storage.service';
import { IProjectRepository } from '../../projects/domain/project.abstract-repository';
import { IUserCompanyRepository } from '../../liens/lienUserCompany/domain/user-company.abstract-repository';
import type { JwtPayload } from '../../auth/domain/jwt-payload';

@Injectable()
export class DeliverablesUc {
  constructor(
    private readonly repo: IDeliverableRepository,
    private readonly storage: StorageService,
    @Inject(IProjectRepository) private readonly projectRepo: IProjectRepository,
    @Inject(IUserCompanyRepository) private readonly userCompanyRepo: IUserCompanyRepository,
  ) {}

  async assertProjectAccess(projectId: string, caller: JwtPayload): Promise<void> {
    if (caller.isAdmin) return;
    const project = await this.projectRepo.findById(projectId);
    const companyIds = await this.userCompanyRepo.findCompanyIdsByUserId(caller.sub);
    if (!companyIds.includes(project.companyId)) throw new ForbiddenException();
  }

  async upload(projectId: string, file: Express.Multer.File) {
    const { url, storageKey } = await this.storage.upload(file.buffer, file.originalname, file.mimetype);
    return this.repo.create({
      name: file.originalname,
      url,
      mimeType: file.mimetype,
      size: file.size,
      storageKey,
      projectId,
    });
  }

  async delete(id: string) {
    const deliverable = await this.repo.findById(id);
    await this.storage.delete(deliverable.storageKey);
    await this.repo.delete(id);
  }

  async getDownloadUrl(id: string): Promise<string> {
    const deliverable = await this.repo.findById(id);
    return this.storage.getSignedUrl(deliverable.storageKey);
  }
}
