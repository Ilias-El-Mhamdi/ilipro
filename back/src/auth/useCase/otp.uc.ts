import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { IUserRepository } from '../../users/domain/user.abtract-repository';
import { IOtpRepository } from '../domain/otp.abstract-repository';
import type { UserModel } from '../../users/domain/user.model';

const OTP_TTL_MS = 15 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const OTP_MAX_ATTEMPTS = 3;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class OtpUc {
  private readonly resend: Resend;

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly otpRepo: IOtpRepository,
    config: ConfigService,
  ) {
    this.resend = new Resend(config.get<string>('MAIL_API_KEY'));
  }

  async send(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email.trim().toLowerCase());
    if (!user) throw new BadRequestException('Aucun compte associé à cet email');

    if (user.otpRequestedAt) {
      const elapsed = Date.now() - user.otpRequestedAt.getTime();
      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
        throw new HttpException(`Veuillez attendre ${remainingSeconds}s avant de demander un nouveau code`, HttpStatus.TOO_MANY_REQUESTS);
      }
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    await this.otpRepo.setOtp(user.id, otp, otpExpiry);

    await this.resend.emails.send({
      from: 'ilipro <no-reply@ilipro.elmhamdi.fr>',
      to: [user?.email],
      subject: `Votre code de connexion : ${otp}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; margin: 0;">
            <div style="max-width: 480px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 40px;">
              <h1 style="margin: 0 0 8px; font-size: 24px; color: #f1f5f9;">ilipro</h1>
              <p style="color: #94a3b8; margin: 0 0 32px; font-size: 14px;">Votre code de connexion</p>

              <div style="background: #0f172a; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <span style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #f1f5f9; font-family: monospace;">${otp}</span>
              </div>

              <p style="color: #64748b; font-size: 13px; margin: 0; text-align: center;">
                Ce code expire dans <strong style="color: #94a3b8;">15 minutes</strong>.
              </p>
            </div>
          </body>
        </html>
      `,
    });
  }

  async verify(email: string, otp: string): Promise<UserModel> {
    const user = await this.userRepo.findByEmail(email.trim().toLowerCase());
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    if (!user.otp || !user.otpExpiry) throw new UnauthorizedException('Aucun OTP en attente');

    if (new Date() > user.otpExpiry) {
      await this.otpRepo.clear(user.id);
      throw new UnauthorizedException('Code expiré');
    }

    if (user.otp !== otp.trim()) {
      const attempts = await this.otpRepo.incrementAttempts(user.id);
      if (attempts >= OTP_MAX_ATTEMPTS) {
        await this.otpRepo.clear(user.id);
        throw new UnauthorizedException('Trop de tentatives, demandez un nouveau code');
      }
      throw new UnauthorizedException(`Code incorrect (${attempts}/${OTP_MAX_ATTEMPTS})`);
    }

    await this.otpRepo.clear(user.id);
    return user;
  }
}
