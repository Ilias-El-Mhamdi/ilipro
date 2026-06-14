import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IDeliverableReaderRepo } from '../../repos/deliverable/deliverable.reader.abstract-repo';
import { IDeliverableWriterRepo } from '../../repos/deliverable/deliverable.writer.abstract-repo';
import { IStorageRepo } from '../../repos/storage/storage.abstract-repo';
import { IProjectReaderRepo } from '../../repos/project/project.reader.abstract-repo';
import { IUserCompanyReaderRepo } from '../../repos/userCompany/userCompany.reader.abstract-repo';
import type { JwtPayload } from '../jwt/jwtPayload';

@Injectable()
export class DeliverablesUc {
  constructor(
    @Inject(IDeliverableReaderRepo) private readonly readerRepo: IDeliverableReaderRepo,
    @Inject(IDeliverableWriterRepo) private readonly writerRepo: IDeliverableWriterRepo,
    private readonly storage: IStorageRepo,
    @Inject(IProjectReaderRepo) private readonly projectRepo: IProjectReaderRepo,
    @Inject(IUserCompanyReaderRepo) private readonly userCompanyRepo: IUserCompanyReaderRepo,
  ) {}

  async assertProjectAccess(projectId: string, caller: JwtPayload): Promise<void> {
    if (caller.isAdmin) return;
    const project = await this.projectRepo.findById(projectId);
    const companyIds = await this.userCompanyRepo.findCompanyIdsByUserId(caller.sub);
    if (!companyIds.includes(project.companyId)) throw new ForbiddenException();
  }

  async upload(projectId: string, file: Express.Multer.File) {
    const { url, storageKey } = await this.storage.upload(file.buffer, file.originalname, file.mimetype);
    return this.writerRepo.create({
      name: file.originalname,
      url,
      mimeType: file.mimetype,
      size: file.size,
      storageKey,
      projectId,
    });
  }

  async delete(id: string) {
    const deliverable = await this.readerRepo.findById(id);
    await this.storage.delete(deliverable.storageKey);
    await this.writerRepo.delete(id);
  }

  async getDownloadUrl(id: string): Promise<string> {
    const deliverable = await this.readerRepo.findById(id);
    return this.storage.getSignedUrl(deliverable.storageKey, deliverable.name);
  }
}
