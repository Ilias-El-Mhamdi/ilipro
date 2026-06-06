import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ILicenseRepository } from '../domain/license.abstract-repository';
import { CreateLicenseInput, UpdateLicenseInput } from '../domain/license.abstract-repository';
import { LicenseModel } from '../domain/license.model';
import { LicenseMachineModel } from '../domain/license-machine.model';
import { LicenseProjectModel } from '../domain/license-project.model';

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

  async findByUserId(userId: string): Promise<LicenseModel> {
    const license = await this.repo.findOne({ where: { userId }, relations, order: machinesOrder });
    if (!license) throw new NotFoundException(`No license found for user ${userId}`);
    return license;
  }

  findByUserAndCompany(userId: string, companyId: string): Promise<LicenseModel | null> {
    return this.repo.findOne({ where: { userId, companyId }, relations, order: machinesOrder });
  }

  findByStripeSubscriptionId(subscriptionId: string): Promise<LicenseModel | null> {
    return this.repo.findOne({ where: { stripeSubscriptionId: subscriptionId }, relations, order: machinesOrder });
  }

  async create(input: CreateLicenseInput): Promise<LicenseModel> {
    const existing = await this.findByUserAndCompany(input.userId, input.companyId);
    if (existing) throw new BadRequestException(`User already has a license for this company`);

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
        projectIds.map((projectId) =>
          this.projectRepo.create({ licenseId: license.id, projectId }),
        ),
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
          projectIds.map((projectId) =>
            this.projectRepo.create({ licenseId: id, projectId }),
          ),
        );
      }
    }
    if (Object.keys(data).length) {
      await this.repo.update(id, data);
    }
    return this.repo.findOneOrFail({ where: { id }, relations, order: machinesOrder });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async removeMachine(licenseId: string, machineId: string): Promise<void> {
    await this.machineRepo.delete({ licenseId, machineId });
  }

  async activate(licenseKey: string, machineId: string, label?: string): Promise<{ valid: true }> {
    const license = await this.findByUserId(licenseKey);

    if (license.status !== 'ACTIVE') {
      throw new ForbiddenException(`License is ${license.status.toLowerCase()}`);
    }

    if (!license.machineLock) {
      const r = await this.machineRepo.update({ licenseId: license.id, machineId }, { lastSeenAt: new Date() });
      if (r.affected === 0) {
        await this.machineRepo.save(this.machineRepo.create({ licenseId: license.id, machineId, label }));
      }
      return { valid: true };
    }

    const existing = await this.machineRepo.findOne({ where: { licenseId: license.id, machineId } });
    if (existing) {
      await this.machineRepo.update({ licenseId: license.id, machineId }, { lastSeenAt: new Date() });
      return { valid: true };
    }

    const count = await this.machineRepo.count({ where: { licenseId: license.id } });
    if (count >= license.maxMachines) {
      throw new ForbiddenException(`Machine limit reached (${license.maxMachines}). Deactivate an existing machine first.`);
    }

    await this.machineRepo.save(this.machineRepo.create({ licenseId: license.id, machineId, label }));
    return { valid: true };
  }
}
