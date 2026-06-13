import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ILicenseWriterRepo } from '../../../../core/repos/license/license.writer.abstract-repo';
import type { LicenseType, LicenseStatus } from '../../../../core/repos/license/license.entity';
import { AdminGuard } from '../../../../infra/guards/admin.guard';

interface CreateLicenseDto {
  userId: string;
  companyId: string;
  type: LicenseType;
  status?: LicenseStatus;
  projectIds?: string[];
  machineLock?: boolean;
  maxMachines?: number;
  validUntil?: string;
  priceLabel?: string;
}

interface UpdateLicenseDto {
  type?: LicenseType;
  status?: LicenseStatus;
  projectIds?: string[];
  machineLock?: boolean;
  maxMachines?: number;
  validUntil?: string | null;
  stripeSubscriptionId?: string | null;
  stripeProductId?: string | null;
  priceLabel?: string | null;
  currentPeriodEnd?: string | null;
}

@UseGuards(AdminGuard)
@Controller('licenses')
export class LicensesController {
  constructor(private readonly repo: ILicenseWriterRepo) {}

  @Post()
  create(@Body() dto: CreateLicenseDto) {
    return this.repo.create({
      ...dto,
      status: dto.status ?? 'ACTIVE',
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLicenseDto) {
    return this.repo.update(id, {
      ...dto,
      validUntil: dto.validUntil !== undefined ? (dto.validUntil ? new Date(dto.validUntil) : null) : undefined,
      currentPeriodEnd: dto.currentPeriodEnd !== undefined ? (dto.currentPeriodEnd ? new Date(dto.currentPeriodEnd) : null) : undefined,
    });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.repo.delete(id);
  }

  @Delete(':id/machines/:machineId')
  removeMachine(@Param('id') id: string, @Param('machineId') machineId: string) {
    return this.repo.removeMachine(id, machineId);
  }
}
