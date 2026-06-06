import type { MigrationInterface, QueryRunner } from 'typeorm';

export class LicenseClientIdToUserId1780900000000 implements MigrationInterface {
  name = 'LicenseClientIdToUserId1780900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old unique constraint
    await queryRunner.query(`ALTER TABLE "License" DROP CONSTRAINT "UQ_d92749bff8db91be416ea5eacc7"`);

    // Rename column and fix types
    await queryRunner.query(`ALTER TABLE "License" RENAME COLUMN "clientId" TO "userId"`);
    await queryRunner.query(`ALTER TABLE "License" ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid`);
    await queryRunner.query(`ALTER TABLE "License" ALTER COLUMN "companyId" TYPE uuid USING "companyId"::uuid`);

    // Recreate unique constraint with new name
    await queryRunner.query(`ALTER TABLE "License"
      ADD CONSTRAINT "UQ_license_userId_companyId" UNIQUE ("userId", "companyId")`);

    // Add FK constraints
    await queryRunner.query(`ALTER TABLE "License"
      ADD CONSTRAINT "FK_license_userId" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "License"
      ADD CONSTRAINT "FK_license_companyId" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "License" DROP CONSTRAINT "FK_license_companyId"`);
    await queryRunner.query(`ALTER TABLE "License" DROP CONSTRAINT "FK_license_userId"`);
    await queryRunner.query(`ALTER TABLE "License" DROP CONSTRAINT "UQ_license_userId_companyId"`);
    await queryRunner.query(`ALTER TABLE "License" ALTER COLUMN "companyId" TYPE character varying`);
    await queryRunner.query(`ALTER TABLE "License" ALTER COLUMN "userId" TYPE character varying`);
    await queryRunner.query(`ALTER TABLE "License" RENAME COLUMN "userId" TO "clientId"`);
    await queryRunner.query(`ALTER TABLE "License"
      ADD CONSTRAINT "UQ_d92749bff8db91be416ea5eacc7" UNIQUE ("clientId", "companyId")`);
  }
}
