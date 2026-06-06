import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1780787058532 implements MigrationInterface {
  name = 'InitialSchema1780787058532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "Company"
                             (
                               "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
                               "name"      character varying NOT NULL,
                               "slug"      character varying NOT NULL,
                               "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
                               "updatedAt" TIMESTAMP         NOT NULL DEFAULT now(),
                               CONSTRAINT "UQ_dda3bfd79b2bcfcfb0483e130a9" UNIQUE ("slug"),
                               CONSTRAINT "PK_b4993a6b3d3194767a59698298f" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "Project"
                             (
                               "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
                               "name"         character varying NOT NULL,
                               "slug"         character varying NOT NULL,
                               "appUrl"       character varying,
                               "docsUrl"      character varying,
                               "changelogUrl" character varying,
                               "companyId"    character varying NOT NULL,
                               "createdAt"    TIMESTAMP         NOT NULL DEFAULT now(),
                               "updatedAt"    TIMESTAMP         NOT NULL DEFAULT now(),
                               CONSTRAINT "UQ_956f1f0ac42ce236bec3adc9f97" UNIQUE ("companyId", "slug"),
                               CONSTRAINT "PK_2725f461500317f74b0c8f11859" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "User"
                             (
                               "id"               uuid              NOT NULL DEFAULT uuid_generate_v4(),
                               "slug"             character varying NOT NULL,
                               "firstName"        character varying,
                               "lastName"         character varying,
                               "email"            character varying NOT NULL,
                               "isAdmin"          boolean           NOT NULL DEFAULT false,
                               "stripeCustomerId" character varying,
                               "otp"              character varying,
                               "otpExpiry"        TIMESTAMP,
                               "otpAttempts"      integer           NOT NULL DEFAULT '0',
                               "otpRequestedAt"   TIMESTAMP,
                               "createdAt"        TIMESTAMP         NOT NULL DEFAULT now(),
                               "updatedAt"        TIMESTAMP         NOT NULL DEFAULT now(),
                               CONSTRAINT "UQ_70f42c60b74c0e931f0d599f03d" UNIQUE ("slug"),
                               CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"),
                               CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "UserCompany"
                             (
                               "id"        uuid      NOT NULL DEFAULT uuid_generate_v4(),
                               "userId"    uuid      NOT NULL,
                               "companyId" uuid      NOT NULL,
                               "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                               CONSTRAINT "UQ_e1b10f365921e3041a01b175178" UNIQUE ("userId", "companyId"),
                               CONSTRAINT "PK_1bdcb69e2148086d3e7e579b29d" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "LicenseMachine"
                             (
                               "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
                               "licenseId"   uuid              NOT NULL,
                               "machineId"   character varying NOT NULL,
                               "label"       character varying,
                               "activatedAt" TIMESTAMP         NOT NULL DEFAULT now(),
                               "lastSeenAt"  TIMESTAMP WITH TIME ZONE,
                               CONSTRAINT "UQ_1c821555da8a613f48730b1424d" UNIQUE ("licenseId", "machineId"),
                               CONSTRAINT "PK_cf1ac571b83dd5f1b70705065e5" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "LicenseProject"
                             (
                               "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
                               "licenseId" uuid              NOT NULL,
                               "projectId" character varying NOT NULL,
                               CONSTRAINT "UQ_a135942d3e6f1422567a849c4ee" UNIQUE ("licenseId", "projectId"),
                               CONSTRAINT "PK_a388a994956a5349701917186f9" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "License"
                             (
                               "id"                   uuid              NOT NULL DEFAULT uuid_generate_v4(),
                               "userId"               uuid              NOT NULL,
                               "companyId"            uuid              NOT NULL,
                               "type"                 character varying NOT NULL,
                               "status"               character varying NOT NULL,
                               "machineLock"          boolean           NOT NULL DEFAULT false,
                               "maxMachines"          integer           NOT NULL DEFAULT '1',
                               "stripeSubscriptionId" character varying,
                               "stripeProductId"      character varying,
                               "priceLabel"           character varying,
                               "currentPeriodEnd"     TIMESTAMP WITH TIME ZONE,
                               "validUntil"           TIMESTAMP WITH TIME ZONE,
                               "createdAt"            TIMESTAMP         NOT NULL DEFAULT now(),
                               "updatedAt"            TIMESTAMP         NOT NULL DEFAULT now(),
                               CONSTRAINT "UQ_e997eccae6e7691947117933589" UNIQUE ("userId", "companyId"),
                               CONSTRAINT "PK_6acb8469749ceb97c1219af491e" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "Deliverable"
                             (
                               "id"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
                               "name"       character varying NOT NULL,
                               "url"        character varying NOT NULL,
                               "mimeType"   character varying NOT NULL,
                               "size"       integer           NOT NULL,
                               "storageKey" character varying NOT NULL,
                               "projectId"  character varying NOT NULL,
                               "createdAt"  TIMESTAMP         NOT NULL DEFAULT now(),
                               "updatedAt"  TIMESTAMP         NOT NULL DEFAULT now(),
                               CONSTRAINT "PK_a35868a3f79f8d102c6787fb205" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "UserCompany"
      ADD CONSTRAINT "FK_90d8b9cf12e07893a4bac48dd17" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "UserCompany"
      ADD CONSTRAINT "FK_96e11a9a889402c62921908ee74" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "LicenseMachine"
      ADD CONSTRAINT "FK_b1d6b524202d138614cdba98828" FOREIGN KEY ("licenseId") REFERENCES "License" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "LicenseProject"
      ADD CONSTRAINT "FK_df34172c98a55e43430c1f6796c" FOREIGN KEY ("licenseId") REFERENCES "License" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "License"
      ADD CONSTRAINT "FK_5b4617ab66b06fe1efbc316156d" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "License"
      ADD CONSTRAINT "FK_7677a8babaf37fb51e39b7b09b9" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "License" DROP CONSTRAINT "FK_7677a8babaf37fb51e39b7b09b9"`);
    await queryRunner.query(`ALTER TABLE "License" DROP CONSTRAINT "FK_5b4617ab66b06fe1efbc316156d"`);
    await queryRunner.query(`ALTER TABLE "LicenseProject" DROP CONSTRAINT "FK_df34172c98a55e43430c1f6796c"`);
    await queryRunner.query(`ALTER TABLE "LicenseMachine" DROP CONSTRAINT "FK_b1d6b524202d138614cdba98828"`);
    await queryRunner.query(`ALTER TABLE "UserCompany" DROP CONSTRAINT "FK_96e11a9a889402c62921908ee74"`);
    await queryRunner.query(`ALTER TABLE "UserCompany" DROP CONSTRAINT "FK_90d8b9cf12e07893a4bac48dd17"`);
    await queryRunner.query(`DROP TABLE "Deliverable"`);
    await queryRunner.query(`DROP TABLE "License"`);
    await queryRunner.query(`DROP TABLE "LicenseProject"`);
    await queryRunner.query(`DROP TABLE "LicenseMachine"`);
    await queryRunner.query(`DROP TABLE "UserCompany"`);
    await queryRunner.query(`DROP TABLE "User"`);
    await queryRunner.query(`DROP TABLE "Project"`);
    await queryRunner.query(`DROP TABLE "Company"`);
  }
}
