import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LicenseRepository, CreateLicenseInput, UpdateLicenseInput } from '../domain/license.repository';
import type { License, LicenseMachine } from '../domain/license.entity';

const licenseInclude = {
  projectAccess: true,
  machines: { orderBy: { activatedAt: 'asc' as const } },
};

@Injectable()
export class PrismaLicenseRepository implements LicenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByClientId(clientId: string): Promise<License | null> {
    return this.prisma.license.findFirst({
      where: { clientId },
      include: licenseInclude,
    }) as Promise<License | null>;
  }

  findByClientAndCompany(clientId: string, companyId: string): Promise<License | null> {
    return this.prisma.license.findUnique({
      where: { clientId_companyId: { clientId, companyId } },
      include: licenseInclude,
    }) as Promise<License | null>;
  }

  findByStripeSubscriptionId(subscriptionId: string): Promise<License | null> {
    return this.prisma.license.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      include: licenseInclude,
    }) as Promise<License | null>;
  }

  async create(input: CreateLicenseInput): Promise<License> {
    const { projectIds, ...data } = input;
    return this.prisma.license.create({
      data: {
        ...data,
        machineLock: data.machineLock ?? false,
        maxMachines: data.maxMachines ?? 1,
        projectAccess: projectIds?.length
          ? { create: projectIds.map((projectId) => ({ projectId })) }
          : undefined,
      },
      include: licenseInclude,
    }) as unknown as Promise<License>;
  }

  async update(id: string, input: UpdateLicenseInput): Promise<License> {
    const { projectIds, ...data } = input;

    if (projectIds !== undefined) {
      await this.prisma.licenseProject.deleteMany({ where: { licenseId: id } });
    }

    return this.prisma.license.update({
      where: { id },
      data: {
        ...data,
        projectAccess: projectIds !== undefined
          ? { create: projectIds.map((projectId) => ({ projectId })) }
          : undefined,
      },
      include: licenseInclude,
    }) as unknown as Promise<License>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.license.delete({ where: { id } });
  }

  async addMachine(licenseId: string, machineId: string, label?: string): Promise<LicenseMachine> {
    return this.prisma.licenseMachine.create({
      data: { licenseId, machineId, label },
    });
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

  findMachine(licenseId: string, machineId: string): Promise<LicenseMachine | null> {
    return this.prisma.licenseMachine.findUnique({
      where: { licenseId_machineId: { licenseId, machineId } },
    });
  }
}
