/**
 * Entry point for running database migrations.
 */
import 'reflect-metadata';
import { migrateLatest } from 'src/_core/utils/knexMigrateUtils';
import migrations from 'src/migrations/_index';
import Db from 'src/_core/Db';
import log from 'src/utils/log';

/**
 * Run API server database migrations exported from `src/migrations/_index`
 */
export default async function runMigrations(db: Db) {
  return migrateLatest(db.knex, migrations);
}

// If called directly (node dist/migrate.js), run migrations using the default knex instance.
if (require.main === module) {
  (async () => {
    log('Running migrations');
    const db = Db.getDefault();
    const results = await runMigrations(db);
    const names = results[1];
    if (names.length) {
      log(names.map(s => '  ' + s).join('\n'));
    }
    log('Done');
    await db.knex.destroy();
  })();
}
