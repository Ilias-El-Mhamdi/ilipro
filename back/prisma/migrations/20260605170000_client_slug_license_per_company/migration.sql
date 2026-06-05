-- Add slug to Client
ALTER TABLE "Client" ADD COLUMN "slug" TEXT;

-- Generate slug from firstName-lastName for existing rows
UPDATE "Client" SET "slug" = LOWER("firstName") || '-' || LOWER("lastName");

-- Resolve duplicates by appending short id suffix
UPDATE "Client" c1 SET "slug" = c1."slug" || '-' || LOWER(SUBSTRING(c1."id", 1, 4))
WHERE (
  SELECT COUNT(*) FROM "Client" c2 WHERE c2."slug" = c1."slug"
) > 1;

ALTER TABLE "Client" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");

-- Update License: drop clientId unique, add composite unique
DROP INDEX IF EXISTS "License_clientId_key";
CREATE UNIQUE INDEX "License_clientId_companyId_key" ON "License"("clientId", "companyId");
