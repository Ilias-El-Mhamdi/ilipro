import { BadRequestException, Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtUc } from './useCase/jwt.uc';
import { OtpUc } from './useCase/otp.uc';
import { Public } from './decorators/public.decorator';

const COOKIE_NAME = 'ilipro_session';
const COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtUc: JwtUc,
    private readonly otpUc: OtpUc,
  ) {}

  @Post('send-otp')
  @HttpCode(200)
  async sendOtp(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email requis');
    await this.otpUc.send(email);
    return { message: 'OTP envoyé' };
  }

  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string, @Res({ passthrough: true }) res: Response) {
    if (!email || !otp) throw new BadRequestException('Email et OTP requis');

    const user = await this.otpUc.verify(email, otp);
    const { token, payload } = await this.jwtUc.create(user);

    const isDEV = process.env.NODE_ENV === 'dev';
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: !isDEV,
      sameSite: !isDEV ? 'none' : 'lax',
      maxAge: COOKIE_TTL_MS,
    });

    return { user: payload };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME);
    return { message: 'Déconnecté' };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new UnauthorizedException('Non authentifié');
    return this.jwtUc.verify(token);
  }
}
