import { BadRequestException, Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import type { Request, Response } from 'express';
import { JwtUc } from '../../../core/flows/jwt/jwt.uc';
import { OtpUc } from '../../../core/flows/jwt/otp.uc';
import { Public } from '../../decorators/public.decorator';
import type { SendOtpBody } from 'platform/contracts/login/sendOtp/sendOtp.request';
import type { VerifyOtpBody } from 'platform/contracts/login/verifyOtp/verifyOtp.request';
import { SendOtpRequest } from 'platform/contracts/login/sendOtp/sendOtp.request';
import { VerifyOtpRequest } from 'platform/contracts/login/verifyOtp/verifyOtp.request';
import { LogoutRequest } from 'platform/contracts/login/logout/logout.request';
import { MeRequest } from 'platform/contracts/login/me/me.request';

const COOKIE_NAME = 'ilipro_session';
const COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

class SendOtpDto implements SendOtpBody {
  @IsEmail()
  email: string;
}

class VerifyOtpDto implements VerifyOtpBody {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}

@Public()
@Controller()
export class LoginController {
  constructor(
    private readonly jwtUc: JwtUc,
    private readonly otpUc: OtpUc,
  ) {}

  @Post(SendOtpRequest.BASE_URL)
  @HttpCode(200)
  async sendOtp(@Body() dto: SendOtpDto) {
    if (!dto.email) throw new BadRequestException('Email requis');
    await this.otpUc.send(dto.email);
    return { message: 'OTP envoyé' };
  }

  @Post(VerifyOtpRequest.BASE_URL)
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    if (!dto.email || !dto.otp) throw new BadRequestException('Email et OTP requis');

    const user = await this.otpUc.verify(dto.email, dto.otp);
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

  @Post(LogoutRequest.BASE_URL)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME);
    return { message: 'Déconnecté' };
  }

  @Get(MeRequest.BASE_URL)
  async me(@Req() req: Request) {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined;
    if (!token) throw new UnauthorizedException('Non authentifié');
    return this.jwtUc.verify(token);
  }
}
