import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientRepository } from '../domain/client.repository';
import type { Client } from '../domain/client.entity';

function toSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly licenseInclude = {
    projectAccess: { include: { project: true } },
    machines: { orderBy: { activatedAt: 'asc' as const } },
  };

  findAll(): Promise<Client[]> {
    return this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        licenses: { include: this.licenseInclude, take: 1 },
      },
    }).then((rows) =>
      rows.map((r) => ({ ...r, license: r.licenses[0] ?? null })) as unknown as Client[],
    );
  }

  findByCompanyId(companyId: string): Promise<Client[]> {
    return this.prisma.client.findMany({
      where: { companies: { some: { companyId } } },
      orderBy: { createdAt: 'desc' },
      include: {
        licenses: {
          where: { companyId },
          include: this.licenseInclude,
        },
      },
    }).then((rows) =>
      rows.map((r) => ({ ...r, license: r.licenses[0] ?? null })) as unknown as Client[],
    );
  }

  findById(id: string): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        licenses: { include: this.licenseInclude, take: 1 },
      },
    }).then((r) => r ? { ...r, license: r.licenses[0] ?? null } as unknown as Client : null);
  }

  async findBySlug(slug: string): Promise<unknown | null> {
    const client = await this.prisma.client.findUnique({
      where: { slug },
      include: {
        companies: {
          include: {
            company: {
              include: { projects: { orderBy: { createdAt: 'asc' as const } } },
            },
          },
        },
        licenses: { include: this.licenseInclude },
      },
    });

    if (!client) return null;

    return {
      id: client.id,
      slug: client.slug,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      stripeCustomerId: client.stripeCustomerId,
      createdAt: client.createdAt,
      companies: client.companies.map((cc) => ({
        id: cc.company.id,
        name: cc.company.name,
        slug: cc.company.slug,
        license: client.licenses.find((l) => l.companyId === cc.company.id) ?? null,
        projects: cc.company.projects,
      })),
    };
  }

  findByEmail(email: string): Promise<Client | null> {
    return this.prisma.client.findFirst({ where: { email } }) as Promise<Client | null>;
  }

  async create(firstName: string, lastName: string, email: string): Promise<Client> {
    const base = toSlug(firstName, lastName);
    let slug = base;
    let i = 2;
    while (await this.prisma.client.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    return this.prisma.client.create({ data: { firstName, lastName, email, slug } }) as unknown as Client;
  }

  update(id: string, firstName: string, lastName: string): Promise<Client> {
    return this.prisma.client.update({
      where: { id },
      data: { firstName, lastName },
    }) as unknown as Promise<Client>;
  }

  async setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void> {
    await this.prisma.client.update({ where: { id }, data: { stripeCustomerId } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({ where: { id } });
  }

  async linkToCompany(clientId: string, companyId: string): Promise<void> {
    await this.prisma.clientCompany.create({ data: { clientId, companyId } });
  }

  async unlinkFromCompany(clientId: string, companyId: string): Promise<void> {
    await this.prisma.clientCompany.deleteMany({ where: { clientId, companyId } });
  }

  async isLinkedToCompany(clientId: string, companyId: string): Promise<boolean> {
    const row = await this.prisma.clientCompany.findUnique({
      where: { clientId_companyId: { clientId, companyId } },
    });
    return row !== null;
  }
}
