import { Body, Controller, ForbiddenException, Get, Param, Post, Req } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import type { Request } from 'express';
import { IReadLicenseRepo } from '../../../../core/repos/readLicense/readLicense.abstract-repo';
import { Public } from '../../../decorators/public.decorator';
import { LicenseMapper } from '../../../mappers/license.mapper';
import type { JwtPayload } from '../../../../core/flows/jwt/jwt-payload';
import type { ActivateLicenseBody } from 'contracts/userDashboard/activateLicense/activateLicense.body';
import { License } from 'contracts/shared/license';
import { ActivateLicenseResponse } from 'contracts/userDashboard/activateLicense/activateLicense.response';
import { ReadLicenseRequest } from 'contracts/userDashboard/readLicense/readLicense.request';
import { ActivateLicenseRequest } from 'contracts/userDashboard/activateLicense/activateLicense.request';

class ActivateLicenseDto implements ActivateLicenseBody {
  @IsString()
  licenseKey: string;

  @IsString()
  machineId: string;

  @IsOptional()
  @IsString()
  label?: string;
}

@Controller()
export class ReadLicenseController {
  constructor(private readonly repo: IReadLicenseRepo) {}

  @Get(ReadLicenseRequest.BASE_URL)
  async findByUser(@Param('userId') userId: string, @Req() req: Request): Promise<License> {
    const caller = req['user'] as JwtPayload;
    if (!caller.isAdmin && caller.sub !== userId) throw new ForbiddenException();
    return LicenseMapper.toResponse(await this.repo.findByUserId(userId));
  }

  @Public()
  @Post(ActivateLicenseRequest.BASE_URL)
  activate(@Body() dto: ActivateLicenseDto): Promise<ActivateLicenseResponse> {
    return this.repo.activate(dto.licenseKey, dto.machineId, dto.label);
  }
}
