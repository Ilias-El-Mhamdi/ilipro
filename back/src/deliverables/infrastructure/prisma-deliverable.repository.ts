import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliverableRepository } from '../domain/deliverable.repository';
import { DeliverableEntity } from '../domain/deliverable.entity';
import type { DeliverableModel } from '../domain/deliverable.model';

@Injectable()
export class PrismaDeliverableRepository implements DeliverableRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toModel(row: any): DeliverableModel {
    return Object.assign(new DeliverableEntity(), row).toModel();
  }

  findAll(): Promise<DeliverableModel[]> {
    return this.prisma.deliverable
      .findMany({ orderBy: { createdAt: 'desc' } })
      .then((rows) => rows.map(this.toModel.bind(this)));
  }

  findByProjectId(projectId: string): Promise<DeliverableModel[]> {
    return this.prisma.deliverable
      .findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } })
      .then((rows) => rows.map(this.toModel.bind(this)));
  }

  findById(id: string): Promise<DeliverableModel | null> {
    return this.prisma.deliverable
      .findUnique({ where: { id } })
      .then((r) => (r ? this.toModel(r) : null));
  }

  create(data: Omit<DeliverableModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliverableModel> {
    return this.prisma.deliverable.create({ data }).then((r) => this.toModel(r));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deliverable.delete({ where: { id } });
  }
}
