export type LicenseType = 'CLASSIC' | 'FREE' | 'ADMIN';
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export class LicenseMachine {
  id: string;
  licenseId: string;
  machineId: string;
  label: string | null;
  activatedAt: Date;
  lastSeenAt: Date | null;
}

export class LicenseProject {
  id: string;
  licenseId: string;
  projectId: string;
}

export class License {
  id: string;
  clientId: string;
  companyId: string;
  type: LicenseType;
  status: LicenseStatus;
  projectAccess: LicenseProject[];
  machineLock: boolean;
  maxMachines: number;
  machines: LicenseMachine[];
  stripeSubscriptionId: string | null;
  stripeProductId: string | null;
  priceLabel: string | null;
  currentPeriodEnd: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
