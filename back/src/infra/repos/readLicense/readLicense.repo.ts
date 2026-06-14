import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IReadLicenseRepo } from '../../../core/repos/readLicense/readLicense.abstract-repo';
import { LicenseEntity } from '../../../core/repos/license/license.entity';
import { LicenseMachineEntity } from '../../../core/repos/license/licenseMachine.entity';
import { LicenseProjectEntity } from '../../../core/repos/license/licenseProject.entity';

const relations = { projectAccess: true, machines: true };
const machinesOrder = { machines: { activatedAt: 'ASC' as const } };

@Injectable()
export class ReadLicenseRepo implements IReadLicenseRepo {
  constructor(
    @InjectRepository(LicenseEntity)
    private readonly repo: Repository<LicenseEntity>,
    @InjectRepository(LicenseMachineEntity)
    private readonly machineRepo: Repository<LicenseMachineEntity>,
    @InjectRepository(LicenseProjectEntity)
    private readonly projectRepo: Repository<LicenseProjectEntity>,
  ) {}

  async findByUserId(userId: string): Promise<LicenseEntity> {
    const license = await this.repo.findOne({ where: { userId }, relations, order: machinesOrder });
    if (!license) throw new NotFoundException(`No license found for user ${userId}`);
    return license;
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
