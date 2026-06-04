import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientRepository } from '../domain/client.repository';
import type { Client } from '../domain/client.entity';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Client[]> {
    return this.prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findByProjectId(projectId: string): Promise<Client[]> {
    return this.prisma.client.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<Client | null> {
    return this.prisma.client.findUnique({ where: { id } });
  }

  create(name: string, email: string, projectId: string): Promise<Client> {
    return this.prisma.client.create({ data: { name, email, projectId } });
  }

  update(id: string, name: string, email: string): Promise<Client> {
    return this.prisma.client.update({ where: { id }, data: { name, email } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({ where: { id } });
  }
}
