import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtUc } from '../useCase/jwt.uc';

const COOKIE_NAME = 'ilipro_session';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtUc: JwtUc, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new UnauthorizedException('Non authentifié');
    req['user'] = await this.jwtUc.verify(token);
    return true;
  }
}
