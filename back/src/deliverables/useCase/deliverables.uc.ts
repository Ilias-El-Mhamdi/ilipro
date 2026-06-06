import { Injectable } from '@nestjs/common';
import { IDeliverableRepository } from '../domain/deliverable.abstract-repository';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class DeliverablesUc {
  constructor(
    private readonly repo: IDeliverableRepository,
    private readonly storage: StorageService,
  ) {}

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
}
