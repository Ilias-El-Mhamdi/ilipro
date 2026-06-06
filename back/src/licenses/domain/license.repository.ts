import type { LicenseModel, LicenseMachineModel, LicenseType, LicenseStatus } from './license.model';

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

export abstract class ILicenseRepository {
  abstract findByClientId(clientId: string): Promise<LicenseModel | null>;
  abstract findByClientAndCompany(clientId: string, companyId: string): Promise<LicenseModel | null>;
  abstract findByStripeSubscriptionId(subscriptionId: string): Promise<LicenseModel | null>;
  abstract create(input: CreateLicenseInput): Promise<LicenseModel>;
  abstract update(id: string, input: UpdateLicenseInput): Promise<LicenseModel>;
  abstract delete(id: string): Promise<void>;
  abstract addMachine(licenseId: string, machineId: string, label?: string): Promise<LicenseMachineModel>;
  abstract removeMachine(licenseId: string, machineId: string): Promise<void>;
  abstract updateMachineLastSeen(licenseId: string, machineId: string): Promise<void>;
  abstract countMachines(licenseId: string): Promise<number>;
  abstract findMachine(licenseId: string, machineId: string): Promise<LicenseMachineModel | null>;
}
