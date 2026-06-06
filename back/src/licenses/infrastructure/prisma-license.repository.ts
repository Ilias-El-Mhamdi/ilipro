import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LicenseRepository, CreateLicenseInput, UpdateLicenseInput } from '../domain/license.repository';
import { LicenseEntity, LicenseMachineEntity } from '../domain/license.entity';
import type { LicenseModel, LicenseMachineModel } from '../domain/license.model';

const licenseInclude = {
  projectAccess: true,
  machines: { orderBy: { activatedAt: 'asc' as const } },
};

@Injectable()
export class PrismaLicenseRepository implements LicenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toModel(row: any): LicenseModel {
    return Object.assign(new LicenseEntity(), {
      ...row,
      projectAccess: row.projectAccess ?? [],
      machines: row.machines ?? [],
    }).toModel();
  }

  findByClientId(clientId: string): Promise<LicenseModel | null> {
    return this.prisma.license
      .findFirst({ where: { clientId }, include: licenseInclude })
      .then((r) => (r ? this.toModel(r) : null));
  }

  findByClientAndCompany(clientId: string, companyId: string): Promise<LicenseModel | null> {
    return this.prisma.license
      .findUnique({
        where: { clientId_companyId: { clientId, companyId } },
        include: licenseInclude,
      })
      .then((r) => (r ? this.toModel(r) : null));
  }

  findByStripeSubscriptionId(subscriptionId: string): Promise<LicenseModel | null> {
    return this.prisma.license
      .findFirst({ where: { stripeSubscriptionId: subscriptionId }, include: licenseInclude })
      .then((r) => (r ? this.toModel(r) : null));
  }

  async create(input: CreateLicenseInput): Promise<LicenseModel> {
    const { projectIds, ...data } = input;
    const created = await this.prisma.license.create({
      data: {
        ...data,
        machineLock: data.machineLock ?? false,
        maxMachines: data.maxMachines ?? 1,
        projectAccess: projectIds?.length
          ? { create: projectIds.map((projectId) => ({ projectId })) }
          : undefined,
      },
      include: licenseInclude,
    });
    return this.toModel(created);
  }

  async update(id: string, input: UpdateLicenseInput): Promise<LicenseModel> {
    const { projectIds, ...data } = input;

    if (projectIds !== undefined) {
      await this.prisma.licenseProject.deleteMany({ where: { licenseId: id } });
    }

    const updated = await this.prisma.license.update({
      where: { id },
      data: {
        ...data,
        projectAccess: projectIds !== undefined
          ? { create: projectIds.map((projectId) => ({ projectId })) }
          : undefined,
      },
      include: licenseInclude,
    });
    return this.toModel(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.license.delete({ where: { id } });
  }

  async addMachine(licenseId: string, machineId: string, label?: string): Promise<LicenseMachineModel> {
    const row = await this.prisma.licenseMachine.create({
      data: { licenseId, machineId, label },
    });
    return Object.assign(new LicenseMachineEntity(), row).toModel();
  }

  async removeMachine(licenseId: string, machineId: string): Promise<void> {
    await this.prisma.licenseMachine.delete({
      where: { licenseId_machineId: { licenseId, machineId } },
    });
  }

  async updateMachineLastSeen(licenseId: string, machineId: string): Promise<void> {
    await this.prisma.licenseMachine.update({
      where: { licenseId_machineId: { licenseId, machineId } },
      data: { lastSeenAt: new Date() },
    });
  }

  countMachines(licenseId: string): Promise<number> {
    return this.prisma.licenseMachine.count({ where: { licenseId } });
  }

  findMachine(licenseId: string, machineId: string): Promise<LicenseMachineModel | null> {
    return this.prisma.licenseMachine
      .findUnique({ where: { licenseId_machineId: { licenseId, machineId } } })
      .then((r) => (r ? Object.assign(new LicenseMachineEntity(), r).toModel() : null));
  }
}
