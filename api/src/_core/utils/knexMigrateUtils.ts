/**
 * This module includes utilities intended to reduce boilerplate when writing knex database migrations.
 */
import Knex, { MigratorConfig } from 'knex';
import Migration from '../Migration';

/**
 * Runs the passed knex migrations.
 *
 * @param knex - The knex instance to use to run the migrations.
 * @param migrations - The array of migrations to run.
 * @returns A promise that resolves the knex migration result [migrationCount, migrationNames[]]
 */
export async function migrateLatest(
  knex: Knex,
  migrations: Migration[],
): Promise<[number, string[]]> {
  const migratorConfig: MigratorConfigWithSource = {
    migrationSource: new MigrationSource(knex, migrations),
  };
  return await knex.migrate.latest(migratorConfig);
}

/**
 * Rolls back the passed knex migrations.
 *
 * @param knex - The knex instance to use to run the migrations.
 * @param migrations - The array of migrations to run the rollback against.
 * @returns Promise<void>
 */
export async function migrateRollback(
  knex: Knex,
  migrations: Migration[],
): Promise<void> {
  const migratorConfig: MigratorConfigWithSource = {
    migrationSource: new MigrationSource(knex, migrations),
  };
  return knex.migrate.rollback(migratorConfig);
}

/**
 * Creates a migration function that drops `tableName` if it exists.
 *
 * @param tableName - Name of the table to drop.
 * @returns Knex migration down function.
 */
export function downTable(tableName: string): MigrateFunction {
  return async function migrationDown(knex: Knex) {
    return knex.schema.dropTableIfExists(tableName);
  };
}

/**
 * Creates a migration function that creates `tableName` if it doesn't exist
 * using the `buildTable` function to define columns and relations.
 *
 * @param tableName - Name of the table to be created.
 * @param buildTable - Table builder function for adding columns.
 */
export function upTable(
  tableName: string,
  buildTable: BuildTable,
): MigrateFunction {
  return async function migrationUp(knex: Knex) {
    if (!(await knex.schema.hasTable(tableName))) {
      await knex.schema.createTable(tableName, buildTable);
    }
  };
}

/**
 * Creates an up migration function that creates `tableName` if it doesn't exist
 * using the `buildTable` function to define columns and relations.
 *
 * @param tableName - Name of the table to be created.
 * @param buildTable - Table builder function for adding columns.
 */
export function alterTable(
  tableName: string,
  buildTable: BuildTable,
): MigrateFunction {
  return async function migrationUp(knex: Knex) {
    if (await knex.schema.hasTable(tableName)) {
      await knex.schema.alterTable(tableName, buildTable);
    }
  };
}

type MigratorConfigWithSource = MigratorConfig & {
  migrationSource: MigrationSource;
};
type MigrateFunction = (knex: Knex) => Promise<void>;
type BuildTable = (builder: Knex.TableBuilder) => any;

class MigrationSource {
  constructor(
    public readonly knex: Knex,
    public readonly migrations: Migration[],
  ) {}

  getMigrations() {
    return Promise.resolve(this.migrations);
  }

  getMigrationName(migration: Migration) {
    return migration.name;
  }

  getMigration(migration: Migration) {
    const { knex } = this;
    const config = {
      disableTransactions: knex.client.config.client === 'sqlite3',
      ...migration.config,
    };
    return { ...migration, config };
  }
}
