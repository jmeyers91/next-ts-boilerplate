/**
 * Entry point for running database migrations.
 */
import 'reflect-metadata';
import Knex from 'knex';
import { migrateLatest } from '../utils/knexMigrateUtils';
import getMigrations from '../migrations/_index';
import log from '../utils/log';

/**
 * Run API server database migrations exported from `src/migrations/_index`
 */
export default async function runMigrations(knex: Knex) {
  return migrateLatest(knex, await getMigrations());
}

// If called directly (node dist/migrate.js), run migrations using the default knex instance.
if (require.main === module) {
  (async () => {
    const knex = (await import('../knex')).default;
    log('Running migrations');
    const results = await runMigrations(knex);
    const names = results[1];
    if (names.length) {
      log(names.map(s => '  ' + s).join('\n'));
    }
    log('Done');
    await knex.destroy();
  })();
}
