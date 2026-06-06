import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IDeliverableRepository } from '../domain/deliverable.abstract-repository';
import { DeliverableModel } from '../domain/deliverable.model';

@Injectable()
export class DeliverableRepository implements IDeliverableRepository {
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

  async findById(id: string): Promise<DeliverableModel> {
    const deliverable = await this.repo.findOne({ where: { id } });
    if (!deliverable) throw new NotFoundException(`Deliverable ${id} not found`);
    return deliverable;
  }

  create(data: Omit<DeliverableModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliverableModel> {
    return this.repo.save(this.repo.create(data));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
