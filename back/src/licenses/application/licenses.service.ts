import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LicenseRepository, CreateLicenseInput, UpdateLicenseInput } from '../domain/license.repository';

@Injectable()
export class LicensesService {
  constructor(private readonly repo: LicenseRepository) {}

  async findByClientId(clientId: string) {
    const license = await this.repo.findByClientId(clientId);
    if (!license) throw new NotFoundException(`No license found for client ${clientId}`);
    return license;
  }

  findByClientAndCompany(clientId: string, companyId: string) {
    return this.repo.findByClientAndCompany(clientId, companyId);
  }

  findByStripeSubscriptionId(subscriptionId: string) {
    return this.repo.findByStripeSubscriptionId(subscriptionId);
  }

  async create(input: CreateLicenseInput) {
    const existing = await this.repo.findByClientAndCompany(input.clientId, input.companyId);
    if (existing) throw new BadRequestException(`Client already has a license for this company`);
    return this.repo.create(input);
  }

  update(id: string, input: UpdateLicenseInput) {
    return this.repo.update(id, input);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }

  removeMachine(licenseId: string, machineId: string) {
    return this.repo.removeMachine(licenseId, machineId);
  }

  async activate(licenseKey: string, machineId: string, label?: string) {
    const license = await this.repo.findByClientId(licenseKey);
    if (!license) throw new NotFoundException('License not found');

    if (license.status !== 'ACTIVE') {
      throw new ForbiddenException(`License is ${license.status.toLowerCase()}`);
    }

    if (!license.machineLock) {
      await this.repo.updateMachineLastSeen(license.id, machineId).catch(() => {
        return this.repo.addMachine(license.id, machineId, label);
      });
      return { valid: true };
    }

    const existing = await this.repo.findMachine(license.id, machineId);
    if (existing) {
      await this.repo.updateMachineLastSeen(license.id, machineId);
      return { valid: true };
    }

    const count = await this.repo.countMachines(license.id);
    if (count >= license.maxMachines) {
      throw new ForbiddenException(
        `Machine limit reached (${license.maxMachines}). Deactivate an existing machine first.`,
      );
    }

    await this.repo.addMachine(license.id, machineId, label);
    return { valid: true };
  }
}
