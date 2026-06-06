import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ILicenseRepository } from '../domain/license.abstract-repository';
import type { LicenseType, LicenseStatus } from '../domain/license.model';

interface CreateLicenseDto {
  clientId: string;
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

interface ActivateDto {
  licenseKey: string;
  machineId: string;
  label?: string;
}

@Controller('licenses')
export class LicensesController {
  constructor(private readonly repo: ILicenseRepository) {}

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string) {
    return this.repo.findByClientId(clientId);
  }

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

  @Post('activate')
  activate(@Body() dto: ActivateDto) {
    return this.repo.activate(dto.licenseKey, dto.machineId, dto.label);
  }
}
