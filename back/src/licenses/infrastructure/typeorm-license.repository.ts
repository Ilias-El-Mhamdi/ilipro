import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ILicenseRepository } from '../domain/license.repository';
import { CreateLicenseInput, UpdateLicenseInput } from '../domain/license.repository';
import { LicenseModel, LicenseMachineModel, LicenseProjectModel } from '../domain/license.model';

const relations = { projectAccess: true, machines: true };
const machinesOrder = { machines: { activatedAt: 'ASC' as const } };

@Injectable()
export class TypeOrmLicenseRepository implements ILicenseRepository {
  constructor(
    @InjectRepository(LicenseModel)
    private readonly repo: Repository<LicenseModel>,
    @InjectRepository(LicenseMachineModel)
    private readonly machineRepo: Repository<LicenseMachineModel>,
    @InjectRepository(LicenseProjectModel)
    private readonly projectRepo: Repository<LicenseProjectModel>,
  ) {}

  findByClientId(clientId: string): Promise<LicenseModel | null> {
    return this.repo.findOne({ where: { clientId }, relations, order: machinesOrder });
  }

  findByClientAndCompany(clientId: string, companyId: string): Promise<LicenseModel | null> {
    return this.repo.findOne({ where: { clientId, companyId }, relations, order: machinesOrder });
  }

  findByStripeSubscriptionId(subscriptionId: string): Promise<LicenseModel | null> {
    return this.repo.findOne({
      where: { stripeSubscriptionId: subscriptionId },
      relations,
      order: machinesOrder,
    });
  }

  async create(input: CreateLicenseInput): Promise<LicenseModel> {
    const { projectIds, ...data } = input;
    const license = await this.repo.save(
      this.repo.create({
        ...data,
        machineLock: data.machineLock ?? false,
        maxMachines: data.maxMachines ?? 1,
      }),
    );
    if (projectIds?.length) {
      await this.projectRepo.save(
        projectIds.map((projectId) => this.projectRepo.create({ licenseId: license.id, projectId })),
      );
    }
    return this.repo.findOneOrFail({ where: { id: license.id }, relations, order: machinesOrder });
  }

  async update(id: string, input: UpdateLicenseInput): Promise<LicenseModel> {
    const { projectIds, ...data } = input;
    if (projectIds !== undefined) {
      await this.projectRepo.delete({ licenseId: id });
      if (projectIds.length) {
        await this.projectRepo.save(
          projectIds.map((projectId) => this.projectRepo.create({ licenseId: id, projectId })),
        );
      }
    }
    if (Object.keys(data).length) {
      await this.repo.update(id, data as any);
    }
    return this.repo.findOneOrFail({ where: { id }, relations, order: machinesOrder });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async addMachine(licenseId: string, machineId: string, label?: string): Promise<LicenseMachineModel> {
    return this.machineRepo.save(this.machineRepo.create({ licenseId, machineId, label }));
  }

  async removeMachine(licenseId: string, machineId: string): Promise<void> {
    await this.machineRepo.delete({ licenseId, machineId });
  }

  async updateMachineLastSeen(licenseId: string, machineId: string): Promise<void> {
    await this.machineRepo.update({ licenseId, machineId }, { lastSeenAt: new Date() });
  }

  countMachines(licenseId: string): Promise<number> {
    return this.machineRepo.count({ where: { licenseId } });
  }

  findMachine(licenseId: string, machineId: string): Promise<LicenseMachineModel | null> {
    return this.machineRepo.findOne({ where: { licenseId, machineId } });
  }
}
