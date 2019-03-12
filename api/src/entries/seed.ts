/**
 * Entry point for running database seeds.
 */
import 'reflect-metadata';
import Knex from 'knex';
import getSeeds from '../seeds/_index';
import getModels from '../models/_index';
import log from '../utils/log';

/**
 * Run API server database seeds exported from `src/seeds/_index`
 */
export default async function runSeeds(knex: Knex) {
  const seeds = await getSeeds();
  for (const { default: seedFn } of seeds) {
    await seedFn(getModels(knex), knex);
  }
  return seeds.map(seed => seed.default.name);
}

// If called directly (node dist/migrate.js), run seeds using the default knex instance.
if (require.main === module) {
  (async () => {
    const knex = (await import('../knex')).default;
    log('Running seeds');
    /* tslint:disable */
    console.time('done');
    /* tslint:enable */
    const ranSeeds = await runSeeds(knex);
    if (ranSeeds.length) {
      log(ranSeeds.map(s => '  ' + s).join('\n'));
    }
    /* tslint:disable */
    console.timeEnd('done');
    /* tslint:enable */
    await knex.destroy();
  })();
}
