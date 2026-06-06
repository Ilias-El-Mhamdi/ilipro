import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LicensesUc } from '../useCase/licenses.uc';
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
  constructor(private readonly uc: LicensesUc) {}

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string) {
    return this.uc.findByClientId(clientId);
  }

  @Post()
  create(@Body() dto: CreateLicenseDto) {
    return this.uc.create({
      ...dto,
      status: dto.status ?? 'ACTIVE',
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      priceLabel: dto.priceLabel,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLicenseDto) {
    return this.uc.update(id, {
      ...dto,
      validUntil: dto.validUntil !== undefined
        ? dto.validUntil ? new Date(dto.validUntil) : null
        : undefined,
      currentPeriodEnd: dto.currentPeriodEnd !== undefined
        ? dto.currentPeriodEnd ? new Date(dto.currentPeriodEnd) : null
        : undefined,
    });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.uc.delete(id);
  }

  @Delete(':id/machines/:machineId')
  removeMachine(
    @Param('id') id: string,
    @Param('machineId') machineId: string,
  ) {
    return this.uc.removeMachine(id, machineId);
  }

  @Post('activate')
  activate(@Body() dto: ActivateDto) {
    return this.uc.activate(dto.licenseKey, dto.machineId, dto.label);
  }
}
