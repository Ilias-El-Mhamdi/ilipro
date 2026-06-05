ALTER TABLE "Client" ADD COLUMN "firstName" TEXT;
ALTER TABLE "Client" ADD COLUMN "lastName" TEXT;

UPDATE "Client" SET "firstName" = split_part(name, ' ', 1), "lastName" = NULLIF(trim(substring(name from position(' ' in name))), '');
UPDATE "Client" SET "lastName" = "firstName" WHERE "lastName" IS NULL;

ALTER TABLE "Client" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "Client" ALTER COLUMN "lastName" SET NOT NULL;

ALTER TABLE "Client" DROP COLUMN "name";
