import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IDeliverableRepository } from '../domain/deliverable.repository';
import { DeliverableModel } from '../domain/deliverable.model';

@Injectable()
export class TypeOrmDeliverableRepository implements IDeliverableRepository {
  constructor(
    @InjectRepository(DeliverableModel)
    private readonly repo: Repository<DeliverableModel>,
  ) {}

  findAll(): Promise<DeliverableModel[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findByProjectId(projectId: string): Promise<DeliverableModel[]> {
    return this.repo.find({ where: { projectId }, order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<DeliverableModel | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Omit<DeliverableModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliverableModel> {
    return this.repo.save(this.repo.create(data));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
