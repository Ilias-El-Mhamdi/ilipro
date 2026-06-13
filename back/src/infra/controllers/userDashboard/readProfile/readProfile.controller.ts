import { Controller, ForbiddenException, Get, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IReadProfileRepository } from '../../../../core/repos/readProfile/readProfile.abstract-repo';
import type { JwtPayload } from '../../../../core/flows/jwt/jwt-payload';

@Controller('users')
export class ReadProfileController {
  constructor(private readonly repo: IReadProfileRepository) {}

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    const caller = req['user'] as JwtPayload;
    if (!caller.isAdmin && caller.slug !== slug) throw new ForbiddenException();
    return this.repo.findBySlug(slug);
  }
}
