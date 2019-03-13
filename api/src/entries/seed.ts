/**
 * Entry point for running database seeds.
 */
import 'reflect-metadata';
import Db from 'src/_core/Db';
import getSeeds from 'src/seeds/_index';
import log from 'src/utils/log';

/**
 * Run API server database seeds exported from `src/seeds/_index`
 */
export default async function runSeeds(db: Db) {
  const seeds = await getSeeds();
  for (const { default: seedFn } of seeds) {
    await seedFn(db);
  }
  return seeds.map(seed => seed.default.name);
}

// If called directly (node dist/migrate.js), run seeds using the default knex instance.
if (require.main === module) {
  (async () => {
    log('Running seeds');
    const db = Db.getDefault();
    /* tslint:disable */
    console.time('done');
    /* tslint:enable */
    const ranSeeds = await runSeeds(db);
    if (ranSeeds.length) {
      log(ranSeeds.map(s => '  ' + s).join('\n'));
    }
    /* tslint:disable */
    console.timeEnd('done');
    /* tslint:enable */
    await db.knex.destroy();
  })();
}
