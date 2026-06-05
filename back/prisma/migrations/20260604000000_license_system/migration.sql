-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('CLASSIC', 'FREE', 'ADMIN');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- Step 1: add companyId as nullable so we can backfill
ALTER TABLE "Client" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Client" ADD COLUMN "stripeCustomerId" TEXT;

-- Step 2: backfill companyId from the related Project
UPDATE "Client" c
SET "companyId" = p."companyId"
FROM "Project" p
WHERE p."id" = c."projectId";

-- Step 3: make companyId required and drop old FK + column
ALTER TABLE "Client" DROP CONSTRAINT "Client_projectId_fkey";
ALTER TABLE "Client" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Client" DROP COLUMN "projectId";

-- Step 4: add new FK
ALTER TABLE "Client" ADD CONSTRAINT "Client_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable License
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "LicenseType" NOT NULL,
    "status" "LicenseStatus" NOT NULL,
    "machineLock" BOOLEAN NOT NULL DEFAULT false,
    "maxMachines" INTEGER NOT NULL DEFAULT 1,
    "stripeSubscriptionId" TEXT,
    "stripeProductId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "License_clientId_key" ON "License"("clientId");

ALTER TABLE "License" ADD CONSTRAINT "License_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable LicenseProject
CREATE TABLE "LicenseProject" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "LicenseProject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LicenseProject_licenseId_projectId_key" ON "LicenseProject"("licenseId", "projectId");

ALTER TABLE "LicenseProject" ADD CONSTRAINT "LicenseProject_licenseId_fkey"
  FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LicenseProject" ADD CONSTRAINT "LicenseProject_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable LicenseMachine
CREATE TABLE "LicenseMachine" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "label" TEXT,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "LicenseMachine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LicenseMachine_licenseId_machineId_key" ON "LicenseMachine"("licenseId", "machineId");

ALTER TABLE "LicenseMachine" ADD CONSTRAINT "LicenseMachine_licenseId_fkey"
  FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
