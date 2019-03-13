import path from 'path';
import Knex from 'knex';
import * as config from '../config';

let cachedKnex: Knex | undefined;

/**
 * Returns the base knex instance for the app.
 * The knex instance is cached.
 */
export default function getDefaultKnex(): Knex {
  if (!cachedKnex) {
    cachedKnex = Knex(config.knexConfig);
  }
  return cachedKnex;
}
