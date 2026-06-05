import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientRepository } from '../domain/client.repository';
import type { Client } from '../domain/client.entity';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  private licenseInclude = {
    license: {
      include: {
        projectAccess: true,
        machines: { orderBy: { activatedAt: 'asc' as const } },
      },
    },
  };

  findAll(): Promise<Client[]> {
    return this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.licenseInclude,
    }) as Promise<Client[]>;
  }

  findByCompanyId(companyId: string): Promise<Client[]> {
    return this.prisma.client.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: this.licenseInclude,
    }) as Promise<Client[]>;
  }

  findById(id: string): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { id },
      include: this.licenseInclude,
    }) as Promise<Client | null>;
  }

  findByEmail(email: string): Promise<Client | null> {
    return this.prisma.client.findFirst({ where: { email } });
  }

  create(name: string, email: string, companyId: string): Promise<Client> {
    return this.prisma.client.create({ data: { name, email, companyId } });
  }

  update(id: string, name: string, email: string): Promise<Client> {
    return this.prisma.client.update({ where: { id }, data: { name, email } });
  }

  async setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void> {
    await this.prisma.client.update({ where: { id }, data: { stripeCustomerId } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({ where: { id } });
  }
}
