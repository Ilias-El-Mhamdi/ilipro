import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRepository } from '../domain/user.repository';
import { UserEntity } from '../domain/user.entity';
import type { UserModel } from '../domain/user.model';

function toSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly licenseInclude = {
    projectAccess: { include: { project: true } },
    machines: { orderBy: { activatedAt: 'asc' as const } },
  };

  private toModel(row: any, license: unknown = null): UserModel {
    return { ...Object.assign(new UserEntity(), row).toModel(), license };
  }

  findAll(): Promise<UserModel[]> {
    return this.prisma.client
      .findMany({
        orderBy: { createdAt: 'desc' },
        include: { licenses: { include: this.licenseInclude, take: 1 } },
      })
      .then((rows) => rows.map((r) => this.toModel(r, r.licenses[0] ?? null)));
  }

  findByCompanyId(companyId: string): Promise<UserModel[]> {
    return this.prisma.client
      .findMany({
        where: { companies: { some: { companyId } } },
        orderBy: { createdAt: 'desc' },
        include: {
          licenses: { where: { companyId }, include: this.licenseInclude },
        },
      })
      .then((rows) => rows.map((r) => this.toModel(r, r.licenses[0] ?? null)));
  }

  findById(id: string): Promise<UserModel | null> {
    return this.prisma.client
      .findUnique({
        where: { id },
        include: { licenses: { include: this.licenseInclude, take: 1 } },
      })
      .then((r) => (r ? this.toModel(r, r.licenses[0] ?? null) : null));
  }

  async findBySlug(slug: string): Promise<unknown | null> {
    const user = await this.prisma.client.findUnique({
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

    if (!user) return null;

    return {
      id: user.id,
      slug: user.slug,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      companies: user.companies.map((cc) => ({
        id: cc.company.id,
        name: cc.company.name,
        slug: cc.company.slug,
        license: user.licenses.find((l) => l.companyId === cc.company.id) ?? null,
        projects: cc.company.projects,
      })),
    };
  }

  findByEmail(email: string): Promise<UserModel | null> {
    return this.prisma.client
      .findFirst({ where: { email } })
      .then((r) => (r ? Object.assign(new UserEntity(), r).toModel() : null));
  }

  async create(data: Pick<UserModel, 'firstName' | 'lastName' | 'email'>): Promise<UserModel> {
    const base = toSlug(data.firstName, data.lastName);
    let slug = base;
    let i = 2;
    while (await this.prisma.client.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    const created = await this.prisma.client.create({ data: { ...data, slug } });
    return Object.assign(new UserEntity(), created).toModel();
  }

  update(id: string, data: Pick<UserModel, 'firstName' | 'lastName'>): Promise<UserModel> {
    return this.prisma.client
      .update({ where: { id }, data })
      .then((r) => Object.assign(new UserEntity(), r).toModel());
  }

  async setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void> {
    await this.prisma.client.update({ where: { id }, data: { stripeCustomerId } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({ where: { id } });
  }

  async linkToCompany(userId: string, companyId: string): Promise<void> {
    await this.prisma.clientCompany.create({ data: { clientId: userId, companyId } });
  }

  async unlinkFromCompany(userId: string, companyId: string): Promise<void> {
    await this.prisma.clientCompany.deleteMany({ where: { clientId: userId, companyId } });
  }

  async isLinkedToCompany(userId: string, companyId: string): Promise<boolean> {
    const row = await this.prisma.clientCompany.findUnique({
      where: { clientId_companyId: { clientId: userId, companyId } },
    });
    return row !== null;
  }
}
