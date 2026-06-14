import { License } from 'platform/contracts/shared/license';
import type { LicenseEntity } from '../../core/repos/license/license.entity';

export class LicenseMapper {
  static toResponse(entity: LicenseEntity): License {
    return Object.assign(new License(), {
      id: entity.id,
      userId: entity.userId,
      companyId: entity.companyId,
      type: entity.type,
      status: entity.status,
      projectAccess: (entity.projectAccess ?? []).map((p) => ({
        id: p.id,
        licenseId: p.licenseId,
        projectId: p.projectId,
      })),
      machineLock: entity.machineLock,
      maxMachines: entity.maxMachines,
      machines: (entity.machines ?? []).map((m) => ({
        id: m.id,
        machineId: m.machineId,
        label: m.label,
        activatedAt: m.activatedAt.toISOString(),
        lastSeenAt: m.lastSeenAt?.toISOString() ?? null,
      })),
      stripeSubscriptionId: entity.stripeSubscriptionId,
      stripeProductId: entity.stripeProductId,
      priceLabel: entity.priceLabel,
      currentPeriodEnd: entity.currentPeriodEnd?.toISOString() ?? null,
      validUntil: entity.validUntil?.toISOString() ?? null,
    });
  }
}
