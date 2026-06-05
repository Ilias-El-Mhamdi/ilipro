-- Delete all existing licenses (they have no company association and are invalid)
DELETE FROM "LicenseMachine";
DELETE FROM "LicenseProject";
DELETE FROM "License";

-- AlterTable: add companyId to License (required)
ALTER TABLE "License" ADD COLUMN "companyId" TEXT NOT NULL DEFAULT 'placeholder';
ALTER TABLE "License" ALTER COLUMN "companyId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
