import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ILicenseRepository } from '../domain/license.abstract-repository';
import type { LicenseType, LicenseStatus } from '../domain/license.model';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { Public } from '../../auth/decorators/public.decorator';
import type { JwtPayload } from '../../auth/domain/jwt-payload';

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

interface ActivateDto {
  licenseKey: string;
  machineId: string;
  label?: string;
}

@Controller('licenses')
export class LicensesController {
  constructor(private readonly repo: ILicenseRepository) {}

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @Req() req: Request) {
    const caller = req['user'] as JwtPayload;
    if (!caller.isAdmin && caller.sub !== userId) throw new ForbiddenException();
    return this.repo.findByUserId(userId);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateLicenseDto) {
    return this.repo.create({
      ...dto,
      status: dto.status ?? 'ACTIVE',
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
    });
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLicenseDto) {
    return this.repo.update(id, {
      ...dto,
      validUntil: dto.validUntil !== undefined ? (dto.validUntil ? new Date(dto.validUntil) : null) : undefined,
      currentPeriodEnd: dto.currentPeriodEnd !== undefined ? (dto.currentPeriodEnd ? new Date(dto.currentPeriodEnd) : null) : undefined,
    });
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.repo.delete(id);
  }

  @UseGuards(AdminGuard)
  @Delete(':id/machines/:machineId')
  removeMachine(@Param('id') id: string, @Param('machineId') machineId: string) {
    return this.repo.removeMachine(id, machineId);
  }

  @Public()
  @Post('activate')
  activate(@Body() dto: ActivateDto) {
    return this.repo.activate(dto.licenseKey, dto.machineId, dto.label);
  }
}
