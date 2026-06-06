import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtpRateLimit1780900000002 implements MigrationInterface {
  name = 'AddOtpRateLimit1780900000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "User" ADD "otpAttempts" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "User" ADD "otpRequestedAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "otpRequestedAt"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "otpAttempts"`);
  }
}
