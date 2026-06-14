import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../core/repos/user/user.entity';
import { IOtpRepo } from '../../../core/repos/otp/otp.abstract-repo';

@Injectable()
export class OtpRepo implements IOtpRepo {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async setOtp(userId: string, otp: string, otpExpiry: Date): Promise<void> {
    await this.repo.update(userId, { otp, otpExpiry, otpAttempts: 0, otpRequestedAt: new Date() });
  }

  async incrementAttempts(userId: string): Promise<number> {
    await this.repo.increment({ id: userId }, 'otpAttempts', 1);
    const user = await this.repo.findOne({ where: { id: userId } });
    return user!.otpAttempts;
  }

  async clear(userId: string): Promise<void> {
    await this.repo.update(userId, { otp: null, otpExpiry: null, otpAttempts: 0, otpRequestedAt: null });
  }
}
