import { Controller, ForbiddenException, Get, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IReadProfileRepo } from '../../../../core/repos/readProfile/readProfile.abstract-repo';
import { ReadProfileMapper } from './readProfile.mapper';
import type { JwtPayload } from '../../../../core/flows/jwt/jwt-payload';
import { ReadProfileResponse } from 'contracts/userDashboard/readProfile/readProfile.response';
import { ReadProfileRequest } from 'contracts/userDashboard/readProfile/readProfile.request';

@Controller()
export class ReadProfileController {
  constructor(private readonly repo: IReadProfileRepo) {}

  @Get(ReadProfileRequest.BASE_URL)
  async findBySlug(@Param('slug') slug: string, @Req() req: Request): Promise<ReadProfileResponse> {
    const caller = req['user'] as JwtPayload;
    if (!caller.isAdmin && caller.slug !== slug) throw new ForbiddenException();
    return ReadProfileMapper.toResponse(await this.repo.findBySlug(slug));
  }
}
