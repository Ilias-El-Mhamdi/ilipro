import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { IOtpRepository } from './domain/otp.abstract-repository';
import { OtpRepository } from './infrastructure/otp.repository';
import { UserModel } from '../users/domain/user.model';
import { JwtUc } from './useCase/jwt.uc';
import { OtpUc } from './useCase/otp.uc';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([UserModel]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: IOtpRepository, useClass: OtpRepository },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    JwtUc,
    OtpUc,
    JwtAuthGuard,
  ],
  exports: [JwtUc],
})
export class AuthModule {}
