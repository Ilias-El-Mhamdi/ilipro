import { Injectable, NotFoundException } from '@nestjs/common';
import { DeliverableRepository } from '../domain/deliverable.repository';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class DeliverablesService {
  constructor(
    private readonly repo: DeliverableRepository,
    private readonly storage: StorageService,
  ) {}

  async findById(id: string) {
    const deliverable = await this.repo.findById(id);
    if (!deliverable) throw new NotFoundException(`Deliverable ${id} not found`);
    return deliverable;
  }

  async upload(projectId: string, file: Express.Multer.File) {
    const { url, storageKey } = await this.storage.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

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
    const deliverable = await this.findById(id);
    await this.storage.delete(deliverable.storageKey);
    await this.repo.delete(id);
  }
}
