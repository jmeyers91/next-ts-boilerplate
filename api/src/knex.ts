import path from 'path';
import Knex from 'knex';

let cachedKnex: Knex | undefined;

/**
 * Returns the base knex instance for the app.
 * The knex instance is cached.
 */
export default function getKnex(): Knex {
  if (!cachedKnex) {
    cachedKnex = Knex({
      client: 'sqlite3',
      useNullAsDefault: true,
      connection: {
        /**
         * Database files are all stored in the API root directory and are named using the env.
         * eg.
         *   production database is /api/production.sqlite3
         *   development database is /api/development.sqlite3
         *   test database is /api/test.sqlite3
         */
        filename: path.resolve(
          __dirname,
          '..',
          `${process.env.NODE_ENV}.sqlite3`,
        ),
      },
    });
  }
  return cachedKnex;
}
