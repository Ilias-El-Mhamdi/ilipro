import { Body, Controller, ForbiddenException, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IReadLicenseRepository } from '../../../../core/repos/readLicense/readLicense.abstract-repo';
import { Public } from '../../../decorators/public.decorator';
import type { JwtPayload } from '../../../../core/flows/jwt/jwt-payload';

interface ActivateDto {
  licenseKey: string;
  machineId: string;
  label?: string;
}

@Controller('licenses')
export class ReadLicenseController {
  constructor(private readonly repo: IReadLicenseRepository) {}

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @Req() req: Request) {
    const caller = req['user'] as JwtPayload;
    if (!caller.isAdmin && caller.sub !== userId) throw new ForbiddenException();
    return this.repo.findByUserId(userId);
  }

  @Public()
  @Post('activate')
  activate(@Body() dto: ActivateDto) {
    return this.repo.activate(dto.licenseKey, dto.machineId, dto.label);
  }
}
