import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDeliverableReaderRepo } from '../../../core/repos/deliverable/deliverable.reader.abstract-repo';
import { IDeliverableWriterRepo } from '../../../core/repos/deliverable/deliverable.writer.abstract-repo';
import { DeliverableEntity } from '../../../core/repos/deliverable/deliverable.entity';

@Injectable()
export class DeliverableRepo implements IDeliverableReaderRepo, IDeliverableWriterRepo {
  constructor(
    @InjectRepository(DeliverableEntity)
    private readonly repo: Repository<DeliverableEntity>,
  ) {}

  findAll(): Promise<DeliverableEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findByProjectId(projectId: string): Promise<DeliverableEntity[]> {
    return this.repo.find({ where: { projectId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<DeliverableEntity> {
    const deliverable = await this.repo.findOne({ where: { id } });
    if (!deliverable) throw new NotFoundException(`Deliverable ${id} not found`);
    return deliverable;
  }

  create(data: Omit<DeliverableEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliverableEntity> {
    return this.repo.save(this.repo.create(data));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
