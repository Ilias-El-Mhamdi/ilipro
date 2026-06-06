import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UserModel } from '../../users/domain/user.model';
import type { JwtPayload } from '../domain/jwt-payload';

@Injectable()
export class JwtUc {
  constructor(private readonly jwtService: JwtService) {}

  async create(user: UserModel): Promise<{ token: string; payload: JwtPayload }> {
    const payload: JwtPayload = {
      sub: user.id,
      slug: user.slug,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token, payload };
  }

  async verify(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Session invalide');
    }
  }
}
