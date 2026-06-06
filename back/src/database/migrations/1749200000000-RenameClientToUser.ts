import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameClientToUser1749200000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Client" RENAME TO "User"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "User" RENAME TO "Client"`);
  }
}
