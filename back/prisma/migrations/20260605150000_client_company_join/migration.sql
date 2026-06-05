-- CreateTable: ClientCompany join table
CREATE TABLE "ClientCompany" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientCompany_pkey" PRIMARY KEY ("id")
);

-- Migrate existing Client.companyId data into ClientCompany
INSERT INTO "ClientCompany" ("id", "clientId", "companyId", "createdAt")
SELECT
    concat('cc', replace(gen_random_uuid()::text, '-', '')),
    "id",
    "companyId",
    "createdAt"
FROM "Client"
WHERE "companyId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ClientCompany_clientId_companyId_key" ON "ClientCompany"("clientId", "companyId");

-- AddForeignKey
ALTER TABLE "ClientCompany" ADD CONSTRAINT "ClientCompany_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientCompany" ADD CONSTRAINT "ClientCompany_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey on Client.companyId
ALTER TABLE "Client" DROP CONSTRAINT IF EXISTS "Client_companyId_fkey";

-- AlterTable: remove companyId from Client
ALTER TABLE "Client" DROP COLUMN IF EXISTS "companyId";
