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

  findByClientIdOrNull(clientId: string) {
    return this.repo.findByClientId(clientId);
  }

  findByStripeSubscriptionId(subscriptionId: string) {
    return this.repo.findByStripeSubscriptionId(subscriptionId);
  }

  async create(input: CreateLicenseInput) {
    const existing = await this.repo.findByClientId(input.clientId);
    if (existing) throw new BadRequestException(`Client ${input.clientId} already has a license`);
    return this.repo.create(input);
  }

  async update(id: string, input: UpdateLicenseInput) {
    return this.repo.update(id, input);
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }

  async removeMachine(licenseId: string, machineId: string) {
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
