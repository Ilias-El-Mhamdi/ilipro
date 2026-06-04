import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliverableRepository } from '../domain/deliverable.repository';
import type { CreateDeliverableDto } from '../domain/deliverable.repository';
import type { Deliverable } from '../domain/deliverable.entity';

@Injectable()
export class PrismaDeliverableRepository implements DeliverableRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Deliverable[]> {
    return this.prisma.deliverable.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findByProjectId(projectId: string): Promise<Deliverable[]> {
    return this.prisma.deliverable.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<Deliverable | null> {
    return this.prisma.deliverable.findUnique({ where: { id } });
  }

  create(dto: CreateDeliverableDto): Promise<Deliverable> {
    return this.prisma.deliverable.create({ data: dto });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deliverable.delete({ where: { id } });
  }
}
