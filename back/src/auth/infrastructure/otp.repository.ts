import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModel } from '../../users/domain/user.model';
import { IOtpRepository } from '../domain/otp.abstract-repository';

@Injectable()
export class OtpRepository implements IOtpRepository {
  constructor(
    @InjectRepository(UserModel)
    private readonly repo: Repository<UserModel>,
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
    await this.repo.update(userId, { otp: null, otpExpiry: null, otpAttempts: 0 });
  }
}
