import type { License, LicenseMachine } from './license.entity';
import type { LicenseType, LicenseStatus } from './license.entity';

export interface CreateLicenseInput {
  clientId: string;
  companyId: string;
  type: LicenseType;
  status: LicenseStatus;
  projectIds?: string[];
  machineLock?: boolean;
  maxMachines?: number;
  validUntil?: Date;
  stripeSubscriptionId?: string;
  stripeProductId?: string;
  priceLabel?: string;
  currentPeriodEnd?: Date;
}

export interface UpdateLicenseInput {
  type?: LicenseType;
  status?: LicenseStatus;
  projectIds?: string[];
  machineLock?: boolean;
  maxMachines?: number;
  validUntil?: Date | null;
  stripeSubscriptionId?: string | null;
  stripeProductId?: string | null;
  priceLabel?: string | null;
  currentPeriodEnd?: Date | null;
}

export abstract class LicenseRepository {
  abstract findByClientId(clientId: string): Promise<License | null>;
  abstract findByClientAndCompany(clientId: string, companyId: string): Promise<License | null>;
  abstract findByStripeSubscriptionId(subscriptionId: string): Promise<License | null>;
  abstract create(input: CreateLicenseInput): Promise<License>;
  abstract update(id: string, input: UpdateLicenseInput): Promise<License>;
  abstract delete(id: string): Promise<void>;
  abstract addMachine(licenseId: string, machineId: string, label?: string): Promise<LicenseMachine>;
  abstract removeMachine(licenseId: string, machineId: string): Promise<void>;
  abstract updateMachineLastSeen(licenseId: string, machineId: string): Promise<void>;
  abstract countMachines(licenseId: string): Promise<number>;
  abstract findMachine(licenseId: string, machineId: string): Promise<LicenseMachine | null>;
}
