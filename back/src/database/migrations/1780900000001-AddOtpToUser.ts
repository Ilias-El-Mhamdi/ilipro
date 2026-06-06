import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtpToUser1780900000001 implements MigrationInterface {
  name = 'AddOtpToUser1780900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "User" ADD "otp" character varying`);
    await queryRunner.query(`ALTER TABLE "User" ADD "otpExpiry" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "otpExpiry"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "otp"`);
  }
}
