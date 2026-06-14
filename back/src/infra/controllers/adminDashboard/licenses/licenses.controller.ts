import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ILicenseWriterRepo } from '../../../../core/repos/license/license.writer.abstract-repo';
import { AdminGuard } from '../../../../infra/guards/admin.guard';
import { LicenseMapper } from '../../../mappers/license.mapper';
import type { CreateLicenseBody } from 'contracts/adminDashboard/licenses/createLicense/createLicense.body';
import type { UpdateLicenseBody } from 'contracts/adminDashboard/licenses/updateLicense/updateLicense.body';
import { License } from 'contracts/shared/license';
import type { LicenseType, LicenseStatus } from 'contracts/shared/license';
import { CreateLicenseRequest } from 'contracts/adminDashboard/licenses/createLicense/createLicense.request';
import { UpdateLicenseRequest } from 'contracts/adminDashboard/licenses/updateLicense/updateLicense.request';
import { DeleteLicenseRequest } from 'contracts/adminDashboard/licenses/deleteLicense/deleteLicense.request';
import { DeleteLicenseMachineRequest } from 'contracts/adminDashboard/licenses/deleteLicenseMachine/deleteLicenseMachine.request';

class CreateLicenseDto implements CreateLicenseBody {
  @IsUUID()
  userId: string;

  @IsUUID()
  companyId: string;

  @IsEnum(['CLASSIC', 'FREE', 'ADMIN'])
  type: LicenseType;

  @IsOptional()
  @IsEnum(['ACTIVE', 'EXPIRED', 'CANCELLED'])
  status?: LicenseStatus;

  @IsOptional()
  @IsArray()
  projectIds?: string[];

  @IsOptional()
  @IsBoolean()
  machineLock?: boolean;

  @IsOptional()
  @IsNumber()
  maxMachines?: number;

  @IsOptional()
  @IsString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  priceLabel?: string;
}

class UpdateLicenseDto implements UpdateLicenseBody {
  @IsOptional()
  @IsEnum(['CLASSIC', 'FREE', 'ADMIN'])
  type?: LicenseType;

  @IsOptional()
  @IsEnum(['ACTIVE', 'EXPIRED', 'CANCELLED'])
  status?: LicenseStatus;

  @IsOptional()
  @IsArray()
  projectIds?: string[];

  @IsOptional()
  @IsBoolean()
  machineLock?: boolean;

  @IsOptional()
  @IsNumber()
  maxMachines?: number;

  @IsOptional()
  @IsString()
  validUntil?: string | null;

  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string | null;

  @IsOptional()
  @IsString()
  stripeProductId?: string | null;

  @IsOptional()
  @IsString()
  priceLabel?: string | null;

  @IsOptional()
  @IsString()
  currentPeriodEnd?: string | null;
}

@UseGuards(AdminGuard)
@Controller()
export class LicensesController {
  constructor(private readonly repo: ILicenseWriterRepo) {}

  @Post(CreateLicenseRequest.BASE_URL)
  async create(@Body() dto: CreateLicenseDto): Promise<License> {
    return LicenseMapper.toResponse(
      await this.repo.create({
        ...dto,
        status: dto.status ?? 'ACTIVE',
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      }),
    );
  }

  @Patch(UpdateLicenseRequest.BASE_URL)
  async update(@Param('id') id: string, @Body() dto: UpdateLicenseDto): Promise<License> {
    return LicenseMapper.toResponse(
      await this.repo.update(id, {
        ...dto,
        validUntil: dto.validUntil !== undefined ? (dto.validUntil ? new Date(dto.validUntil) : null) : undefined,
        currentPeriodEnd: dto.currentPeriodEnd !== undefined ? (dto.currentPeriodEnd ? new Date(dto.currentPeriodEnd) : null) : undefined,
      }),
    );
  }

  @Delete(DeleteLicenseRequest.BASE_URL)
  delete(@Param('id') id: string): Promise<void> {
    return this.repo.delete(id);
  }

  @Delete(DeleteLicenseMachineRequest.BASE_URL)
  removeMachine(@Param('id') id: string, @Param('machineId') machineId: string): Promise<void> {
    return this.repo.removeMachine(id, machineId);
  }
}
