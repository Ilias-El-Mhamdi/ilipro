import type {
  LicenseModel,
  LicenseMachineModel,
  LicenseProjectModel,
} from './license.model';

export class LicenseMachineEntity {
  id: string;
  licenseId: string;
  machineId: string;
  label: string | null;
  activatedAt: Date;
  lastSeenAt: Date | null;

  static fromModel(model: LicenseMachineModel): LicenseMachineEntity {
    return Object.assign(new LicenseMachineEntity(), model);
  }

  toModel(): LicenseMachineModel {
    return {
      id: this.id,
      licenseId: this.licenseId,
      machineId: this.machineId,
      label: this.label,
      activatedAt: this.activatedAt,
      lastSeenAt: this.lastSeenAt,
    };
  }
}

export class LicenseProjectEntity {
  id: string;
  licenseId: string;
  projectId: string;

  static fromModel(model: LicenseProjectModel): LicenseProjectEntity {
    return Object.assign(new LicenseProjectEntity(), model);
  }

  toModel(): LicenseProjectModel {
    return { id: this.id, licenseId: this.licenseId, projectId: this.projectId };
  }
}

export class LicenseEntity {
  id: string;
  clientId: string;
  companyId: string;
  type: LicenseModel['type'];
  status: LicenseModel['status'];
  projectAccess: LicenseProjectEntity[];
  machineLock: boolean;
  maxMachines: number;
  machines: LicenseMachineEntity[];
  stripeSubscriptionId: string | null;
  stripeProductId: string | null;
  priceLabel: string | null;
  currentPeriodEnd: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;

  static fromModel(model: LicenseModel): LicenseEntity {
    const entity = new LicenseEntity();
    entity.id = model.id;
    entity.clientId = model.clientId;
    entity.companyId = model.companyId;
    entity.type = model.type;
    entity.status = model.status;
    entity.machineLock = model.machineLock;
    entity.maxMachines = model.maxMachines;
    entity.stripeSubscriptionId = model.stripeSubscriptionId;
    entity.stripeProductId = model.stripeProductId;
    entity.priceLabel = model.priceLabel;
    entity.currentPeriodEnd = model.currentPeriodEnd;
    entity.validUntil = model.validUntil;
    entity.createdAt = model.createdAt;
    entity.updatedAt = model.updatedAt;
    entity.projectAccess = (model.projectAccess ?? []).map(LicenseProjectEntity.fromModel);
    entity.machines = (model.machines ?? []).map(LicenseMachineEntity.fromModel);
    return entity;
  }

  toModel(): LicenseModel {
    return {
      id: this.id,
      clientId: this.clientId,
      companyId: this.companyId,
      type: this.type,
      status: this.status,
      machineLock: this.machineLock,
      maxMachines: this.maxMachines,
      stripeSubscriptionId: this.stripeSubscriptionId,
      stripeProductId: this.stripeProductId,
      priceLabel: this.priceLabel,
      currentPeriodEnd: this.currentPeriodEnd,
      validUntil: this.validUntil,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      projectAccess: this.projectAccess.map((p) => p.toModel()),
      machines: this.machines.map((m) => m.toModel()),
    };
  }
}
