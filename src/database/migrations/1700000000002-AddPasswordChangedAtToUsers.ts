import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPasswordChangedAtToUsers1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'passwordChangedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // Set passwordChangedAt for existing users to their createdAt date
    await queryRunner.query(`
      UPDATE users 
      SET "passwordChangedAt" = "createdAt" 
      WHERE "passwordChangedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'passwordChangedAt');
  }
}

